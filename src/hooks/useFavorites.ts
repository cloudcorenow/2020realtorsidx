import { useState, useEffect } from 'react';
import { favoritesService, FavoriteProperty } from '../services/favoritesService';
import { useAuth } from './useAuth';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteProperties, setFavoriteProperties] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Subscribe to favorites changes
    const unsubscribe = favoritesService.onFavoritesChange((newFavorites) => {
      setFavorites(new Set(newFavorites));
    });

    // Initialize favorites if user is logged in
    if (user) {
      loadFavorites();
    } else {
      // Clear favorites if user logs out
      setFavorites(new Set());
      setFavoriteProperties([]);
    }

    return unsubscribe;
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await favoritesService.getUserFavorites(user.id);
      setFavoriteProperties(response.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      throw new Error('You must be logged in to save favorites');
    }

    try {
      setError(null);
      const response = await favoritesService.toggleFavorite(propertyId);
      
      // Reload favorites to get updated list
      await loadFavorites();
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update favorites');
      throw err;
    }
  };

  const isFavorited = (propertyId: string): boolean => {
    return favoritesService.isFavorited(propertyId);
  };

  const getFavoriteCount = (): number => {
    return favoritesService.getFavoriteCount();
  };

  const addMultipleFavorites = async (propertyIds: string[]) => {
    if (!user) {
      throw new Error('You must be logged in to save favorites');
    }

    try {
      setError(null);
      setLoading(true);
      await favoritesService.addMultipleFavorites(propertyIds);
      await loadFavorites();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add favorites');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMultipleFavorites = async (propertyIds: string[]) => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);
      await favoritesService.removeMultipleFavorites(propertyIds);
      await loadFavorites();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorites');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    favorites: Array.from(favorites),
    favoriteProperties,
    loading,
    error,
    toggleFavorite,
    isFavorited,
    getFavoriteCount,
    addMultipleFavorites,
    removeMultipleFavorites,
    refetch: loadFavorites,
  };
}

export default useFavorites;