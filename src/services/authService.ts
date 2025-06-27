import { apiService } from './apiService';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of auth state change
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  async signUp(userData: SignUpData): Promise<{ user: AuthUser; token: string }> {
    try {
      const response = await apiService.signUp(userData);
      this.currentUser = response.user;
      this.notifyListeners();
      return response;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(credentials: SignInData): Promise<{ user: AuthUser; token: string }> {
    try {
      const response = await apiService.signIn(credentials);
      this.currentUser = response.user;
      this.notifyListeners();
      return response;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await apiService.signOut();
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if API call fails
      this.currentUser = null;
      this.notifyListeners();
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (this.currentUser) {
        return this.currentUser;
      }

      const response = await apiService.getCurrentUser();
      if (response?.user) {
        this.currentUser = response.user;
        this.notifyListeners();
        return this.currentUser;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get current user synchronously (useful for components)
  getUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Initialize auth state on app start
  async initialize(): Promise<void> {
    try {
      await this.getCurrentUser();
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export convenience functions for backward compatibility
export const signIn = (email: string, password: string) => 
  authService.signIn({ email, password });

export const signUp = (email: string, password: string, additionalData?: Partial<SignUpData>) => 
  authService.signUp({ email, password, ...additionalData });

export const signOut = () => authService.signOut();

export const getCurrentUser = () => authService.getCurrentUser();

export default authService;