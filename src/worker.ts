import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { HTTPException } from 'hono/http-exception';

// API route handlers
import { propertiesRouter } from './api/properties';
import { idxRouter } from './api/idx';
import { authRouter } from './api/auth';
import { contactRouter } from './api/contact';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
  IDX_API_KEY?: string;
  IDX_API_URL?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'https://2020realtors.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Cache static assets
app.use('/assets/*', cache({
  cacheName: 'static-assets',
  cacheControl: 'max-age=31536000, immutable',
}));

// API Routes
app.route('/api/properties', propertiesRouter);
app.route('/api/idx', idxRouter);
app.route('/api/auth', authRouter);
app.route('/api/contact', contactRouter);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT 
  });
});

// Serve static files from ASSETS binding
app.get('*', async (c) => {
  try {
    const url = new URL(c.req.url);
    const path = url.pathname;
    
    // For API routes that don't exist, return 404
    if (path.startsWith('/api/')) {
      throw new HTTPException(404, { message: 'API endpoint not found' });
    }
    
    // Try to fetch the asset from the ASSETS binding
    const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
    
    // If asset is found, return it
    if (assetResponse.status === 200) {
      return assetResponse;
    }
    
    // For client-side routing, serve index.html for non-asset requests
    if (!path.includes('.') && !path.startsWith('/api/')) {
      const indexResponse = await c.env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url)));
      if (indexResponse.status === 200) {
        return new Response(indexResponse.body, {
          headers: {
            ...Object.fromEntries(indexResponse.headers),
            'Content-Type': 'text/html',
          },
        });
      }
    }
    
    // If nothing found, return 404
    throw new HTTPException(404, { message: 'Not Found' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Asset serving error:', error);
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
});

// Global error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong'
  }, 500);
});

export default app;