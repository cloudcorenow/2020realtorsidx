// API service for communicating with Cloudflare Worker backend
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:8787';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Properties API
  async getProperties(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/properties?${queryString}`);
  }

  async getProperty(id: string) {
    return this.request(`/properties/${id}`);
  }

  async getFeaturedProperties() {
    return this.request('/properties/featured/list');
  }

  async toggleFavorite(propertyId: string, userId: string) {
    return this.request('/properties/favorites', {
      method: 'POST',
      body: JSON.stringify({ propertyId, userId }),
    });
  }

  async getUserFavorites(userId: string) {
    return this.request(`/properties/favorites/${userId}`);
  }

  // IDX API
  async searchIDXProperties(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/idx/search?${queryString}`);
  }

  async getIDXProperty(listingId: string) {
    return this.request(`/idx/property/${listingId}`);
  }

  async syncIDXProperties() {
    return this.request('/idx/sync', { method: 'POST' });
  }

  // Auth API
  async signUp(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(credentials: { email: string; password: string }) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    try {
      return await this.request('/auth/me');
    } catch (error) {
      return null;
    }
  }

  async signOut() {
    return this.request('/auth/signout', { method: 'POST' });
  }

  // Contact API
  async submitContactForm(formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    propertyId?: string;
  }) {
    return this.request('/contact/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async requestTour(tourData: {
    name: string;
    email: string;
    phone: string;
    propertyId: string;
    preferredDate: string;
    preferredTime: string;
    message?: string;
  }) {
    return this.request('/contact/tour-request', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;