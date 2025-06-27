import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
};

const propertiesRouter = new Hono<{ Bindings: Bindings }>();

// Validation schemas
const propertySearchSchema = z.object({
  query: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  propertyType: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const favoriteSchema = z.object({
  propertyId: z.string(),
  userId: z.string(),
});

// Get properties with filtering and pagination
propertiesRouter.get('/', zValidator('query', propertySearchSchema), async (c) => {
  const params = c.req.valid('query');
  
  try {
    // Build dynamic SQL query
    let sql = `
      SELECT p.*, a.name as agent_name, a.phone as agent_phone, a.email as agent_email, a.photo as agent_photo
      FROM properties p
      LEFT JOIN agents a ON p.agent_id = a.id
      WHERE 1=1
    `;
    
    const sqlParams: any[] = [];
    
    if (params.query) {
      sql += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.address LIKE ? OR p.city LIKE ?)`;
      const searchTerm = `%${params.query}%`;
      sqlParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (params.minPrice) {
      sql += ` AND p.price >= ?`;
      sqlParams.push(params.minPrice);
    }
    
    if (params.maxPrice) {
      sql += ` AND p.price <= ?`;
      sqlParams.push(params.maxPrice);
    }
    
    if (params.beds) {
      sql += ` AND p.beds >= ?`;
      sqlParams.push(params.beds);
    }
    
    if (params.baths) {
      sql += ` AND p.baths >= ?`;
      sqlParams.push(params.baths);
    }
    
    if (params.propertyType) {
      sql += ` AND p.property_type = ?`;
      sqlParams.push(params.propertyType);
    }
    
    if (params.city) {
      sql += ` AND p.city = ?`;
      sqlParams.push(params.city);
    }
    
    if (params.state) {
      sql += ` AND p.state = ?`;
      sqlParams.push(params.state);
    }
    
    sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    sqlParams.push(params.limit, params.offset);
    
    const { results } = await c.env.DB.prepare(sql).bind(...sqlParams).all();
    
    // Transform results to match frontend Property interface
    const properties = results.map((row: any) => ({
      id: row.id,
      title: row.title,
      price: row.price,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      beds: row.beds,
      baths: row.baths,
      sqft: row.sqft,
      description: row.description,
      propertyType: row.property_type,
      yearBuilt: row.year_built,
      features: JSON.parse(row.features || '[]'),
      images: JSON.parse(row.images || '[]'),
      isFeatured: Boolean(row.is_featured),
      isNew: Boolean(row.is_new),
      status: row.status,
      listingDate: row.listing_date,
      latitude: row.latitude,
      longitude: row.longitude,
      mlsNumber: row.mls_number,
      agent: {
        id: row.agent_id,
        name: row.agent_name,
        photo: row.agent_photo,
        phone: row.agent_phone,
        email: row.agent_email,
      },
    }));
    
    return c.json({ properties, total: properties.length });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return c.json({ error: 'Failed to fetch properties' }, 500);
  }
});

// Get single property by ID
propertiesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, a.name as agent_name, a.phone as agent_phone, a.email as agent_email, a.photo as agent_photo
      FROM properties p
      LEFT JOIN agents a ON p.agent_id = a.id
      WHERE p.id = ?
    `).bind(id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Property not found' }, 404);
    }
    
    const row = results[0] as any;
    const property = {
      id: row.id,
      title: row.title,
      price: row.price,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      beds: row.beds,
      baths: row.baths,
      sqft: row.sqft,
      description: row.description,
      propertyType: row.property_type,
      yearBuilt: row.year_built,
      features: JSON.parse(row.features || '[]'),
      images: JSON.parse(row.images || '[]'),
      isFeatured: Boolean(row.is_featured),
      isNew: Boolean(row.is_new),
      status: row.status,
      listingDate: row.listing_date,
      latitude: row.latitude,
      longitude: row.longitude,
      mlsNumber: row.mls_number,
      agent: {
        id: row.agent_id,
        name: row.agent_name,
        photo: row.agent_photo,
        phone: row.agent_phone,
        email: row.agent_email,
      },
    };
    
    return c.json({ property });
  } catch (error) {
    console.error('Error fetching property:', error);
    return c.json({ error: 'Failed to fetch property' }, 500);
  }
});

// Get featured properties
propertiesRouter.get('/featured/list', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, a.name as agent_name, a.phone as agent_phone, a.email as agent_email, a.photo as agent_photo
      FROM properties p
      LEFT JOIN agents a ON p.agent_id = a.id
      WHERE p.is_featured = 1
      ORDER BY p.created_at DESC
      LIMIT 6
    `).all();
    
    const properties = results.map((row: any) => ({
      id: row.id,
      title: row.title,
      price: row.price,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      beds: row.beds,
      baths: row.baths,
      sqft: row.sqft,
      description: row.description,
      propertyType: row.property_type,
      yearBuilt: row.year_built,
      features: JSON.parse(row.features || '[]'),
      images: JSON.parse(row.images || '[]'),
      isFeatured: Boolean(row.is_featured),
      isNew: Boolean(row.is_new),
      status: row.status,
      listingDate: row.listing_date,
      latitude: row.latitude,
      longitude: row.longitude,
      mlsNumber: row.mls_number,
      agent: {
        id: row.agent_id,
        name: row.agent_name,
        photo: row.agent_photo,
        phone: row.agent_phone,
        email: row.agent_email,
      },
    }));
    
    return c.json({ properties });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return c.json({ error: 'Failed to fetch featured properties' }, 500);
  }
});

// Add/remove property from favorites
propertiesRouter.post('/favorites', zValidator('json', favoriteSchema), async (c) => {
  const { propertyId, userId } = c.req.valid('json');
  
  try {
    // Check if already favorited
    const { results } = await c.env.DB.prepare(`
      SELECT id FROM user_favorites WHERE user_id = ? AND property_id = ?
    `).bind(userId, propertyId).all();
    
    if (results.length > 0) {
      // Remove from favorites
      await c.env.DB.prepare(`
        DELETE FROM user_favorites WHERE user_id = ? AND property_id = ?
      `).bind(userId, propertyId).run();
      
      return c.json({ favorited: false });
    } else {
      // Add to favorites
      await c.env.DB.prepare(`
        INSERT INTO user_favorites (user_id, property_id, created_at)
        VALUES (?, ?, datetime('now'))
      `).bind(userId, propertyId).run();
      
      return c.json({ favorited: true });
    }
  } catch (error) {
    console.error('Error updating favorites:', error);
    return c.json({ error: 'Failed to update favorites' }, 500);
  }
});

// Get user's favorite properties
propertiesRouter.get('/favorites/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, a.name as agent_name, a.phone as agent_phone, a.email as agent_email, a.photo as agent_photo
      FROM properties p
      LEFT JOIN agents a ON p.agent_id = a.id
      INNER JOIN user_favorites uf ON p.id = uf.property_id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC
    `).bind(userId).all();
    
    const properties = results.map((row: any) => ({
      id: row.id,
      title: row.title,
      price: row.price,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      beds: row.beds,
      baths: row.baths,
      sqft: row.sqft,
      description: row.description,
      propertyType: row.property_type,
      yearBuilt: row.year_built,
      features: JSON.parse(row.features || '[]'),
      images: JSON.parse(row.images || '[]'),
      isFeatured: Boolean(row.is_featured),
      isNew: Boolean(row.is_new),
      status: row.status,
      listingDate: row.listing_date,
      latitude: row.latitude,
      longitude: row.longitude,
      mlsNumber: row.mls_number,
      agent: {
        id: row.agent_id,
        name: row.agent_name,
        photo: row.agent_photo,
        phone: row.agent_phone,
        email: row.agent_email,
      },
    }));
    
    return c.json({ properties });
  } catch (error) {
    console.error('Error fetching favorite properties:', error);
    return c.json({ error: 'Failed to fetch favorite properties' }, 500);
  }
});

export { propertiesRouter };