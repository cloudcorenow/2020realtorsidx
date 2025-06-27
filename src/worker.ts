import { Hono } from 'hono';
import { cors } from 'hono/cors';
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
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Basic middleware
app.use('*', logger());
app.use('*', prettyJSON());

// CORS for API routes
app.use('/api/*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://2020realtors.pages.dev',
      'https://2020realtors.workers.dev'
    ];
    return allowedOrigins.includes(origin) || !origin;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
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
    version: '1.0.0'
  });
});

// Static file serving and SPA routing
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  const pathname = url.pathname;
  
  // Skip API routes - they should have been handled above
  if (pathname.startsWith('/api/')) {
    return c.json({ error: 'API endpoint not found' }, 404);
  }

  try {
    // Determine what file to serve
    let targetPath = pathname;
    
    // Root path serves index.html
    if (pathname === '/') {
      targetPath = '/index.html';
    }
    
    // Create request for the asset
    const assetUrl = new URL(targetPath, c.req.url);
    const assetRequest = new Request(assetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
    });

    // Try to fetch the asset
    const assetResponse = await c.env.ASSETS.fetch(assetRequest);
    
    if (assetResponse.ok) {
      // Create new response with proper headers
      const headers = new Headers(assetResponse.headers);
      
      // Set cache headers based on file type
      if (pathname.startsWith('/assets/') || pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (pathname.endsWith('.html') || pathname === '/') {
        headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }
      
      // Ensure proper content type
      if (pathname.endsWith('.html') || pathname === '/') {
        headers.set('Content-Type', 'text/html; charset=utf-8');
      }
      
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers: headers,
      });
    }
    
    // If asset not found and it's not a file extension, serve index.html for SPA routing
    if (!pathname.includes('.') && !pathname.startsWith('/api/')) {
      const indexUrl = new URL('/index.html', c.req.url);
      const indexRequest = new Request(indexUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        },
      });
      
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
    
    // Return 404 for missing files
    return c.json({ error: 'File not found' }, 404);
    
  } catch (error) {
    console.error('Asset serving error:', error);
    
    // Last resort: try to serve index.html for any non-API route
    if (!pathname.startsWith('/api/')) {
      try {
        const fallbackUrl = new URL('/index.html', c.req.url);
        const fallbackRequest = new Request(fallbackUrl.toString());
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
        console.error('Fallback serving error:', fallbackError);
      }
    }
    
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Global error handler
app.onError((err, c) => {
  console.error('Worker error:', {
    message: err.message,
    stack: err.stack,
    url: c.req.url,
    method: c.req.method,
  });
  
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env?.ENVIRONMENT === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  }, 500);
});

export default app;