import { apiService } from './apiService';
import { authService } from './authService';
import { Property } from '../types/property';

export interface FavoriteProperty extends Property {
  favoritedAt: string;
}

class FavoritesService {
  private favorites: Set<string> = new Set();
  private listeners: ((favorites: Set<string>) => void)[] = [];

  // Subscribe to favorites changes
  onFavoritesChange(callback: (favorites: Set<string>) => void) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.favorites);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of favorites change
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.favorites));
  }

  async toggleFavorite(propertyId: string): Promise<{ favorited: boolean }> {
    const user = authService.getUser();
    if (!user) {
      throw new Error('You must be logged in to save favorites');
    }

    try {
      const response = await apiService.toggleFavorite(propertyId, user.id);
      
      if (response.favorited) {
        this.favorites.add(propertyId);
      } else {
        this.favorites.delete(propertyId);
      }
      
      this.notifyListeners();
      return response;
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw new Error('Failed to update favorites. Please try again.');
    }
  }

  async getUserFavorites(userId?: string): Promise<{ properties: FavoriteProperty[] }> {
    const targetUserId = userId || authService.getUser()?.id;
    if (!targetUserId) {
      return { properties: [] };
    }

    try {
      const response = await apiService.getUserFavorites(targetUserId);
      
      // Update local favorites set
      this.favorites.clear();
      response.properties.forEach(property => {
        this.favorites.add(property.id);
      });
      
      this.notifyListeners();
      return response;
    } catch (error) {
      console.error('Get user favorites error:', error);
      throw new Error('Failed to load favorites.');
    }
  }

  // Check if a property is favorited (synchronous)
  isFavorited(propertyId: string): boolean {
    return this.favorites.has(propertyId);
  }

  // Get all favorited property IDs (synchronous)
  getFavoriteIds(): string[] {
    return Array.from(this.favorites);
  }

  // Get count of favorites (synchronous)
  getFavoriteCount(): number {
    return this.favorites.size;
  }

  // Clear all favorites (useful for logout)
  clearFavorites(): void {
    this.favorites.clear();
    this.notifyListeners();
  }

  // Initialize favorites for current user
  async initialize(): Promise<void> {
    const user = authService.getUser();
    if (user) {
      try {
        await this.getUserFavorites(user.id);
      } catch (error) {
        console.error('Favorites initialization error:', error);
      }
    }
  }

  // Bulk add favorites (useful for data migration)
  async addMultipleFavorites(propertyIds: string[]): Promise<void> {
    const user = authService.getUser();
    if (!user) {
      throw new Error('You must be logged in to save favorites');
    }

    const promises = propertyIds.map(propertyId => 
      this.toggleFavorite(propertyId).catch(error => {
        console.error(`Failed to add favorite ${propertyId}:`, error);
        return null;
      })
    );

    await Promise.allSettled(promises);
  }

  // Remove multiple favorites
  async removeMultipleFavorites(propertyIds: string[]): Promise<void> {
    const user = authService.getUser();
    if (!user) {
      return;
    }

    const promises = propertyIds
      .filter(propertyId => this.isFavorited(propertyId))
      .map(propertyId => 
        this.toggleFavorite(propertyId).catch(error => {
          console.error(`Failed to remove favorite ${propertyId}:`, error);
          return null;
        })
      );

    await Promise.allSettled(promises);
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;