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

    // Use the featured endpoint
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

    // Use the search endpoint
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

// Get single property details from IDX
idxRouter.get('/property/:listingId', async (c) => {
  if (!c.env.IDX_API_KEY) {
    return c.json({ error: 'IDX API key not configured' }, 500);
  }

  const listingId = c.req.param('listingId');
  
  try {
    // Check cache first
    const cacheKey = `idx:property:${listingId}`;
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    // Use the listing endpoint
    const data = await makeIDXRequest(`listing/${listingId}`, c.env.IDX_API_KEY);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return c.json({ error: 'Property not found' }, 404);
    }

    const property = transformIDXProperty(Array.isArray(data) ? data[0] : data);
    const result = { property };
    
    // Cache for 10 minutes
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 600 });
    
    return c.json(result);
  } catch (error) {
    console.error('IDX property details error:', error);
    return c.json({ error: 'Failed to fetch property details from IDX' }, 500);
  }
});

// Get property photos from IDX
idxRouter.get('/property/:listingId/photos', async (c) => {
  if (!c.env.IDX_API_KEY) {
    return c.json({ error: 'IDX API key not configured' }, 500);
  }

  const listingId = c.req.param('listingId');
  
  try {
    const cacheKey = `idx:photos:${listingId}`;
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    // Use the images endpoint
    const data = await makeIDXRequest(`listing/${listingId}/images`, c.env.IDX_API_KEY);
    
    const photos = Array.isArray(data) ? data.map((photo: any) => ({
      url: photo.url || photo.image_url,
      caption: photo.caption || '',
      order: photo.order || 0,
    })) : [];
    
    const result = { photos };
    
    // Cache for 30 minutes
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 1800 });
    
    return c.json(result);
  } catch (error) {
    console.error('IDX photos error:', error);
    return c.json({ error: 'Failed to fetch property photos from IDX' }, 500);
  }
});

// Get all listings (for sync)
idxRouter.get('/listings', async (c) => {
  if (!c.env.IDX_API_KEY) {
    return c.json({ error: 'IDX API key not configured' }, 500);
  }

  try {
    const cacheKey = 'idx:all-listings';
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    // Use the listings endpoint to get all active listings
    const data = await makeIDXRequest('listings', c.env.IDX_API_KEY);
    
    const properties = Array.isArray(data) ? data.map(transformIDXProperty) : [];
    const result = { properties, total: properties.length };
    
    // Cache for 10 minutes
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 600 });
    
    return c.json(result);
  } catch (error) {
    console.error('IDX listings error:', error);
    return c.json({ error: 'Failed to fetch IDX listings' }, 500);
  }
});

// Get sold/pending properties
idxRouter.get('/soldpending', async (c) => {
  if (!c.env.IDX_API_KEY) {
    return c.json({ error: 'IDX API key not configured' }, 500);
  }

  try {
    const cacheKey = 'idx:soldpending';
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    // Use the soldpending endpoint
    const data = await makeIDXRequest('soldpending', c.env.IDX_API_KEY);
    
    const properties = Array.isArray(data) ? data.map(transformIDXProperty) : [];
    const result = { properties, total: properties.length };
    
    // Cache for 30 minutes
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 1800 });
    
    return c.json(result);
  } catch (error) {
    console.error('IDX sold/pending error:', error);
    return c.json({ error: 'Failed to fetch sold/pending properties from IDX' }, 500);
  }
});

// Sync IDX properties to local database
idxRouter.post('/sync', async (c) => {
  if (!c.env.IDX_API_KEY) {
    return c.json({ error: 'IDX API key not configured' }, 500);
  }
  
  try {
    // Get all active listings
    const activeData = await makeIDXRequest('listings', c.env.IDX_API_KEY);
    
    // Get featured properties
    const featuredData = await makeIDXRequest('featured', c.env.IDX_API_KEY);
    
    // Get sold/pending properties for comparison
    const soldData = await makeIDXRequest('soldpending', c.env.IDX_API_KEY);
    
    let syncedCount = 0;
    let updatedCount = 0;
    
    // Process all properties
    const allProperties = [
      ...(Array.isArray(activeData) ? activeData : []),
      ...(Array.isArray(featuredData) ? featuredData : []),
      ...(Array.isArray(soldData) ? soldData : [])
    ];
    
    // Remove duplicates based on listingID
    const uniqueProperties = allProperties.filter((property, index, self) => 
      index === self.findIndex(p => p.listingID === property.listingID)
    );
    
    for (const idxProperty of uniqueProperties) {
      try {
        if (!idxProperty.listingID && !idxProperty.idxID) continue;
        
        const listingId = idxProperty.listingID || idxProperty.idxID;
        
        // Check if property already exists
        const { results } = await c.env.DB.prepare(`
          SELECT id FROM properties WHERE mls_number = ?
        `).bind(listingId).all();
        
        const propertyData = transformIDXPropertyForDB(idxProperty);
        
        if (results.length === 0) {
          // Insert new property
          await c.env.DB.prepare(`
            INSERT INTO properties (
              id, title, price, address, city, state, zip, beds, baths, sqft,
              description, property_type, year_built, features, images,
              is_featured, is_new, status, listing_date, latitude, longitude,
              mls_number, agent_id, created_at, updated_at
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?,
              ?, ?, datetime('now'), datetime('now')
            )
          `).bind(
            listingId,
            propertyData.title,
            propertyData.price,
            propertyData.address,
            propertyData.city,
            propertyData.state,
            propertyData.zip,
            propertyData.beds,
            propertyData.baths,
            propertyData.sqft,
            propertyData.description,
            propertyData.property_type,
            propertyData.year_built,
            propertyData.features,
            propertyData.images,
            propertyData.is_featured,
            propertyData.is_new,
            propertyData.status,
            propertyData.listing_date,
            propertyData.latitude,
            propertyData.longitude,
            propertyData.mls_number,
            'rm1' // Default agent
          ).run();
          
          syncedCount++;
        } else {
          // Update existing property
          await c.env.DB.prepare(`
            UPDATE properties SET
              title = ?, price = ?, address = ?, city = ?, state = ?, zip = ?,
              beds = ?, baths = ?, sqft = ?, description = ?, property_type = ?,
              year_built = ?, features = ?, images = ?, status = ?, updated_at = datetime('now')
            WHERE mls_number = ?
          `).bind(
            propertyData.title,
            propertyData.price,
            propertyData.address,
            propertyData.city,
            propertyData.state,
            propertyData.zip,
            propertyData.beds,
            propertyData.baths,
            propertyData.sqft,
            propertyData.description,
            propertyData.property_type,
            propertyData.year_built,
            propertyData.features,
            propertyData.images,
            propertyData.status,
            listingId
          ).run();
          
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error processing property ${idxProperty.listingID || idxProperty.idxID}:`, error);
      }
    }
    
    // Clear relevant caches
    await c.env.CACHE.delete('idx:featured');
    await c.env.CACHE.delete('idx:all-listings');
    await c.env.CACHE.delete('idx:soldpending');
    
    return c.json({ 
      message: `Successfully synced IDX properties`,
      total: uniqueProperties.length,
      synced: syncedCount,
      updated: updatedCount
    });
  } catch (error) {
    console.error('IDX sync error:', error);
    return c.json({ error: 'Failed to sync IDX properties' }, 500);
  }
});

// Get IDX system info
idxRouter.get('/system-info', async (c) => {
  if (!c.env.IDX_API_KEY) {
    return c.json({ error: 'IDX API key not configured' }, 500);
  }
  
  try {
    const data = await makeIDXRequest('systemlinks', c.env.IDX_API_KEY);
    return c.json({ systemInfo: data });
  } catch (error) {
    console.error('IDX system info error:', error);
    return c.json({ error: 'Failed to fetch IDX system info' }, 500);
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
      id: 'rm1',
      name: idxProperty.listingAgentFullName || idxProperty.agentName || 'Roger Martinez',
      photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      phone: idxProperty.listingOfficePhone || '(714) 555-0101',
      email: idxProperty.listingAgentEmail || 'roger@2020realtors.com',
    },
  };
}

// Transform IDX property for database storage
function transformIDXPropertyForDB(idxProperty: any): any {
  const transformed = transformIDXProperty(idxProperty);
  return {
    ...transformed,
    features: JSON.stringify(transformed.features),
    images: JSON.stringify(transformed.images),
    property_type: transformed.propertyType,
    year_built: transformed.yearBuilt,
    is_featured: transformed.isFeatured ? 1 : 0,
    is_new: transformed.isNew ? 1 : 0,
    listing_date: transformed.listingDate,
    mls_number: transformed.mlsNumber,
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
  
  // Add architectural style
  if (idxProperty.architecture) {
    features.push(idxProperty.architecture);
  }
  
  // Add heating/cooling
  if (idxProperty.heating) {
    features.push(`${idxProperty.heating} Heating`);
  }
  if (idxProperty.cooling) {
    features.push(`${idxProperty.cooling} Cooling`);
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