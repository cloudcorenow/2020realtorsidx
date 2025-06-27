import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  IDX_API_KEY?: string;
  IDX_PARTNER_KEY?: string;
};

const idxRouter = new Hono<{ Bindings: Bindings }>();

const idxSearchSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  propertyType: z.string().optional(),
  sqftMin: z.number().optional(),
  sqftMax: z.number().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Base IDX API URL
const IDX_BASE_URL = 'https://api.idxbroker.com/clients';

// Helper function to make IDX API requests
async function makeIDXRequest(endpoint: string, apiKey: string, params: Record<string, any> = {}) {
  const url = new URL(`${IDX_BASE_URL}/${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accesskey': apiKey,
      'outputtype': 'json',
      'apiversion': '1.4.6',
    },
  });

  if (!response.ok) {
    throw new Error(`IDX API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get featured properties from IDX
idxRouter.get('/featured', async (c) => {
  if (!c.env.IDX_API_KEY) {
    return c.json({ error: 'IDX API key not configured' }, 500);
  }

  try {
    // Check cache first
    const cacheKey = 'idx:featured';
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    const data = await makeIDXRequest('featured', c.env.IDX_API_KEY);
    
    // Transform IDX data to our format
    const properties = Array.isArray(data) ? data.map(transformIDXProperty) : [];
    
    const result = { properties, total: properties.length };
    
    // Cache for 15 minutes
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 900 });
    
    return c.json(result);
  } catch (error) {
    console.error('IDX featured properties error:', error);
    return c.json({ error: 'Failed to fetch featured properties from IDX' }, 500);
  }
});

// Search IDX properties
idxRouter.get('/search', zValidator('query', idxSearchSchema), async (c) => {
  if (!c.env.IDX_API_KEY) {
    return c.json({ error: 'IDX API key not configured' }, 500);
  }

  const params = c.req.valid('query');
  
  try {
    // Build IDX search parameters
    const idxParams: Record<string, any> = {};
    
    if (params.city) idxParams.city = params.city;
    if (params.state) idxParams.state = params.state;
    if (params.zipcode) idxParams.zipcode = params.zipcode;
    if (params.minPrice) idxParams.minListPrice = params.minPrice;
    if (params.maxPrice) idxParams.maxListPrice = params.maxPrice;
    if (params.beds) idxParams.bedrooms = params.beds;
    if (params.baths) idxParams.bathrooms = params.baths;
    if (params.sqftMin) idxParams.minSqft = params.sqftMin;
    if (params.sqftMax) idxParams.maxSqft = params.sqftMax;
    if (params.propertyType) idxParams.propertyType = mapPropertyTypeToIDX(params.propertyType);

    // Create cache key based on search parameters
    const cacheKey = `idx:search:${JSON.stringify(idxParams)}`;
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    const data = await makeIDXRequest('search', c.env.IDX_API_KEY, idxParams);
    
    // Transform and limit results
    const allProperties = Array.isArray(data) ? data.map(transformIDXProperty) : [];
    const properties = allProperties.slice(params.offset, params.offset + params.limit);
    
    const result = { 
      properties, 
      total: allProperties.length,
      offset: params.offset,
      limit: params.limit 
    };
    
    // Cache for 5 minutes
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 });
    
    return c.json(result);
  } catch (error) {
    console.error('IDX search error:', error);
    return c.json({ error: 'Failed to search IDX properties' }, 500);
  }
});

// Transform IDX property to our frontend format
function transformIDXProperty(idxProperty: any): any {
  return {
    id: idxProperty.listingID || idxProperty.idxID || idxProperty.id,
    title: `${idxProperty.address || idxProperty.streetName || ''}, ${idxProperty.cityName || idxProperty.city || ''}`.trim(),
    price: parseInt(idxProperty.listPrice || idxProperty.currentPrice || '0') || 0,
    address: idxProperty.address || idxProperty.streetName || '',
    city: idxProperty.cityName || idxProperty.city || '',
    state: idxProperty.state || idxProperty.stateAbbreviation || '',
    zip: idxProperty.zipcode || idxProperty.postalCode || '',
    beds: parseInt(idxProperty.bedrooms || idxProperty.beds || '0') || 0,
    baths: parseFloat(idxProperty.totalBaths || idxProperty.baths || '0') || 0,
    sqft: parseInt(idxProperty.sqFt || idxProperty.livingArea || '0') || 0,
    description: idxProperty.remarksConcat || idxProperty.publicRemarks || idxProperty.description || '',
    propertyType: mapIDXPropertyType(idxProperty.propType || idxProperty.propertyType || 'Residential'),
    yearBuilt: parseInt(idxProperty.yearBuilt || idxProperty.yearBuiltEffective || new Date().getFullYear().toString()),
    features: extractFeatures(idxProperty),
    images: extractImages(idxProperty),
    isFeatured: false,
    isNew: isNewListing(idxProperty.listingDate || idxProperty.dateAdded),
    status: mapIDXStatus(idxProperty.propStatus || idxProperty.status || 'Active'),
    listingDate: idxProperty.listingDate || idxProperty.dateAdded || new Date().toISOString(),
    latitude: parseFloat(idxProperty.latitude || '0') || 0,
    longitude: parseFloat(idxProperty.longitude || '0') || 0,
    mlsNumber: idxProperty.listingID || idxProperty.idxID || idxProperty.mlsNumber,
    agent: {
      id: 'hf1',
      name: idxProperty.listingAgentFullName || idxProperty.agentName || 'Henry Humberto Ferrufino',
      photo: 'placeholder',
      phone: idxProperty.listingOfficePhone || '(714) 470-4444',
      email: idxProperty.listingAgentEmail || 'henry@2020realtors.com',
    },
  };
}

// Helper functions
function mapPropertyTypeToIDX(type: string): string {
  const typeMap: Record<string, string> = {
    'single-family': 'SFR',
    'condo': 'CND',
    'townhouse': 'TWN',
    'multi-family': 'MFR',
    'land': 'LND',
    'commercial': 'COM'
  };
  return typeMap[type] || 'SFR';
}

function mapIDXPropertyType(idxType: string): string {
  const typeMap: Record<string, string> = {
    'SFR': 'single-family',
    'Single Family Residential': 'single-family',
    'Residential': 'single-family',
    'CND': 'condo',
    'Condominium': 'condo',
    'TWN': 'townhouse',
    'Townhouse': 'townhouse',
    'MFR': 'multi-family',
    'Multi-Family': 'multi-family',
    'LND': 'land',
    'Land': 'land',
    'COM': 'commercial',
    'Commercial': 'commercial'
  };
  return typeMap[idxType] || 'single-family';
}

function mapIDXStatus(idxStatus: string): string {
  const statusMap: Record<string, string> = {
    'Active': 'for-sale',
    'Pending': 'pending',
    'Sold': 'sold',
    'Withdrawn': 'sold',
    'Expired': 'sold'
  };
  return statusMap[idxStatus] || 'for-sale';
}

function extractFeatures(idxProperty: any): string[] {
  const features: string[] = [];
  
  // Add common features based on IDX data
  if (idxProperty.garage && parseInt(idxProperty.garage) > 0) {
    features.push(`${idxProperty.garage}-Car Garage`);
  }
  if (idxProperty.pool === 'Y' || idxProperty.poolPrivateYN === 'Y') {
    features.push('Swimming Pool');
  }
  if (idxProperty.fireplace === 'Y' || idxProperty.fireplaceYN === 'Y') {
    features.push('Fireplace');
  }
  if (idxProperty.waterfront === 'Y' || idxProperty.waterfrontYN === 'Y') {
    features.push('Waterfront');
  }
  if (idxProperty.view && idxProperty.view !== 'None') {
    features.push(`${idxProperty.view} View`);
  }
  
  return features.filter(Boolean);
}

function extractImages(idxProperty: any): string[] {
  const images: string[] = [];
  
  // IDX properties might have image URLs in different formats
  if (idxProperty.image) {
    if (Array.isArray(idxProperty.image)) {
      images.push(...idxProperty.image.map((img: any) => img.url || img));
    } else if (typeof idxProperty.image === 'string') {
      images.push(idxProperty.image);
    }
  }
  
  // Check for other image fields
  if (idxProperty.images && Array.isArray(idxProperty.images)) {
    images.push(...idxProperty.images.map((img: any) => img.url || img));
  }
  
  // If no images, use a placeholder
  if (images.length === 0) {
    images.push('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg');
  }
  
  return images.filter(Boolean);
}

function isNewListing(listingDate: string): boolean {
  if (!listingDate) return false;
  const date = new Date(listingDate);
  const now = new Date();
  const daysDiff = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
  return daysDiff <= 7; // Consider listings new if less than 7 days old
}

export { idxRouter };