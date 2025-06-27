import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// API route handlers
import { propertiesRouter } from './api/properties';
import { idxRouter } from './api/idx';
import { authRouter } from './api/auth';
import { contactRouter } from './api/contact';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  ASSETS: Fetcher;
  ENVIRONMENT?: string;
  IDX_API_KEY?: string;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());

// CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://2020realtors.pages.dev', 'https://2020-realtors.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// API Routes
app.route('/api/properties', propertiesRouter);
app.route('/api/idx', idxRouter);
app.route('/api/auth', authRouter);
app.route('/api/contact', contactRouter);

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'production',
    version: '1.0.0'
  });
});

// Handle all other routes - serve static files or SPA fallback
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  const pathname = url.pathname;

  // Skip API routes
  if (pathname.startsWith('/api/')) {
    return c.json({ message: 'API endpoint not found' }, 404);
  }

  try {
    // Try to fetch the requested file from assets
    const assetResponse = await c.env.ASSETS.fetch(c.req.url);
    
    if (assetResponse.status === 200) {
      // File exists, return it with appropriate caching
      const response = new Response(assetResponse.body, assetResponse);
      
      // Add cache headers for static assets
      if (pathname.startsWith('/assets/') || pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        response.headers.set('Cache-Control', 'public, max-age=3600');
      }
      
      return response;
    }
    
    // File not found, serve index.html for SPA routing
    const indexUrl = new URL('/index.html', url.origin);
    const indexResponse = await c.env.ASSETS.fetch(indexUrl.toString());
    
    if (indexResponse.status === 200) {
      return new Response(indexResponse.body, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
    // Fallback HTML if index.html is not available
    return c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>20/20 Realtors | Premier Real Estate Services</title>
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://images.pexels.com">
    
    <!-- Optimized font loading -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Meta tags for SEO and performance -->
    <meta name="description" content="20/20 Realtors - Your trusted partner in Southern California real estate. Find your perfect home with our expert agents and exceptional service.">
    <meta name="keywords" content="real estate, Southern California, homes for sale, property, realtors">
    <meta name="theme-color" content="#1E3A8A">
  </head>
  <body>
    <div id="root">
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Inter, sans-serif;">
        <div style="text-align: center;">
          <h1 style="color: #1E3A8A; margin-bottom: 1rem;">20/20 Realtors</h1>
          <p style="color: #6B7280;">Loading...</p>
        </div>
      </div>
    </div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Asset serving error:', error);
    
    // Return a basic error page
    return c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>20/20 Realtors - Error</title>
  </head>
  <body>
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <h1 style="color: #DC2626; margin-bottom: 1rem;">Service Temporarily Unavailable</h1>
        <p style="color: #6B7280;">Please try again later.</p>
      </div>
    </div>
  </body>
</html>`, 500);
  }
});

// Global error handler
app.onError((err, c) => {
  console.error('Worker Error:', err);
  
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  }, 500);
});

export default app;