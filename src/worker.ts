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

// CORS for API routes only
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'https://2020realtors.pages.dev', 'https://2020realtors.workers.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Cache static assets with proper headers
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
    environment: c.env.ENVIRONMENT || 'production',
    worker: 'active'
  });
});

// Handle all other requests (static files and SPA routing)
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  const pathname = url.pathname;
  
  try {
    // Skip API routes
    if (pathname.startsWith('/api/')) {
      throw new HTTPException(404, { message: 'API endpoint not found' });
    }

    // Try to serve static asset first
    let assetRequest = c.req.raw.clone();
    
    // For root path, serve index.html
    if (pathname === '/') {
      assetRequest = new Request(new URL('/index.html', c.req.url));
    }
    
    const assetResponse = await c.env.ASSETS.fetch(assetRequest);
    
    if (assetResponse.ok) {
      // Clone the response to avoid issues with streaming
      const response = new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers: assetResponse.headers,
      });
      
      // Add cache headers for static assets
      if (pathname.startsWith('/assets/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (pathname.endsWith('.html')) {
        response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }
      
      return response;
    }
    
    // For client-side routing, serve index.html for non-asset requests
    if (!pathname.includes('.')) {
      const indexRequest = new Request(new URL('/index.html', c.req.url));
      const indexResponse = await c.env.ASSETS.fetch(indexRequest);
      
      if (indexResponse.ok) {
        return new Response(indexResponse.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
          },
        });
      }
    }
    
    // If nothing found, return 404
    throw new HTTPException(404, { message: 'Page not found' });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Asset serving error:', error);
    
    // Fallback: try to serve index.html for any non-API route
    if (!pathname.startsWith('/api/')) {
      try {
        const fallbackRequest = new Request(new URL('/index.html', c.req.url));
        const fallbackResponse = await c.env.ASSETS.fetch(fallbackRequest);
        
        if (fallbackResponse.ok) {
          return new Response(fallbackResponse.body, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=0, must-revalidate',
            },
          });
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
    
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
});

// Global error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  
  const isDevelopment = c.env?.ENVIRONMENT === 'development';
  
  return c.json({ 
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  }, 500);
});

export default app;