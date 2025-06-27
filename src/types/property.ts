export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family' | 'land' | 'commercial';
  yearBuilt: number;
  features: string[];
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
  status: 'for-sale' | 'for-rent' | 'sold' | 'pending';
  listingDate: string;
  latitude: number;
  longitude: number;
  mlsNumber: string;
  agent: {
    id: string;
    name: string;
    photo: string;
    phone: string;
    email: string;
  };
}

export interface PropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  propertyType?: string;
  status?: string;
  query?: string;
}