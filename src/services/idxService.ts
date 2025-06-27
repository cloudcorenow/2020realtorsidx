import { Property } from '../types/property';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:8787';

interface IDXSearchParams {
  city?: string;
  state?: string;
  zipcode?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
  sqftMin?: number;
  sqftMax?: number;
  limit?: number;
  offset?: number;
}

class IDXService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api/idx${endpoint}`;
    
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

  async getFeaturedProperties(): Promise<{ properties: Property[]; total: number }> {
    return this.request('/featured');
  }

  async searchProperties(params: IDXSearchParams): Promise<{ 
    properties: Property[]; 
    total: number; 
    offset: number; 
    limit: number; 
  }> {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString());
      }
    });

    return this.request(`/search?${queryString.toString()}`);
  }

  async getProperty(listingId: string): Promise<{ property: Property }> {
    return this.request(`/property/${listingId}`);
  }

  async getPropertyPhotos(listingId: string): Promise<{ 
    photos: Array<{ url: string; caption: string; order: number }> 
  }> {
    return this.request(`/property/${listingId}/photos`);
  }

  async getAllListings(): Promise<{ properties: Property[]; total: number }> {
    return this.request('/listings');
  }

  async getSoldPendingProperties(): Promise<{ properties: Property[]; total: number }> {
    return this.request('/soldpending');
  }

  async syncProperties(): Promise<{ 
    message: string; 
    total: number; 
    synced: number; 
    updated: number; 
  }> {
    return this.request('/sync', { method: 'POST' });
  }

  async getSystemInfo(): Promise<{ systemInfo: any }> {
    return this.request('/system-info');
  }

  // Helper method to build search filters for common use cases
  buildSearchParams(filters: {
    query?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    minBaths?: number;
    city?: string;
    state?: string;
    zipcode?: string;
  }): IDXSearchParams {
    const params: IDXSearchParams = {};

    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.zipcode) params.zipcode = filters.zipcode;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.minBeds) params.beds = filters.minBeds;
    if (filters.minBaths) params.baths = filters.minBaths;
    if (filters.propertyType) params.propertyType = filters.propertyType;

    return params;
  }

  // Method to get properties by location
  async getPropertiesByLocation(
    city: string, 
    state: string, 
    options: Partial<IDXSearchParams> = {}
  ): Promise<{ properties: Property[]; total: number }> {
    return this.searchProperties({
      city,
      state,
      ...options,
    });
  }

  // Method to get properties in price range
  async getPropertiesByPriceRange(
    minPrice: number, 
    maxPrice: number, 
    options: Partial<IDXSearchParams> = {}
  ): Promise<{ properties: Property[]; total: number }> {
    return this.searchProperties({
      minPrice,
      maxPrice,
      ...options,
    });
  }

  // Method to get properties by type
  async getPropertiesByType(
    propertyType: string, 
    options: Partial<IDXSearchParams> = {}
  ): Promise<{ properties: Property[]; total: number }> {
    return this.searchProperties({
      propertyType,
      ...options,
    });
  }

  // Advanced search with multiple filters
  async advancedSearch(filters: {
    location?: { city?: string; state?: string; zipcode?: string };
    price?: { min?: number; max?: number };
    size?: { minBeds?: number; minBaths?: number; minSqft?: number; maxSqft?: number };
    type?: string;
    features?: string[];
  }): Promise<{ properties: Property[]; total: number }> {
    const searchParams: IDXSearchParams = {};

    if (filters.location) {
      if (filters.location.city) searchParams.city = filters.location.city;
      if (filters.location.state) searchParams.state = filters.location.state;
      if (filters.location.zipcode) searchParams.zipcode = filters.location.zipcode;
    }

    if (filters.price) {
      if (filters.price.min) searchParams.minPrice = filters.price.min;
      if (filters.price.max) searchParams.maxPrice = filters.price.max;
    }

    if (filters.size) {
      if (filters.size.minBeds) searchParams.beds = filters.size.minBeds;
      if (filters.size.minBaths) searchParams.baths = filters.size.minBaths;
      if (filters.size.minSqft) searchParams.sqftMin = filters.size.minSqft;
      if (filters.size.maxSqft) searchParams.sqftMax = filters.size.maxSqft;
    }

    if (filters.type) {
      searchParams.propertyType = filters.type;
    }

    return this.searchProperties(searchParams);
  }
}

export const idxService = new IDXService();
export default idxService;