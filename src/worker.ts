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
  origin: ['http://localhost:5173', 'https://2020realtors.pages.dev'],
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

// Serve static assets
app.get('/assets/*', async (c) => {
  try {
    const url = new URL(c.req.url);
    const response = await c.env.ASSETS.fetch(url);
    
    // Add cache headers for static assets
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    return newResponse;
  } catch (error) {
    return c.notFound();
  }
});

// Serve other static files (images, favicon, etc.)
app.get('/*', async (c) => {
  // Skip API routes
  if (c.req.path.startsWith('/api/')) {
    return c.json({ message: 'API endpoint not found' }, 404);
  }
  
  try {
    const url = new URL(c.req.url);
    const response = await c.env.ASSETS.fetch(url);
    
    if (response.status === 404) {
      // For SPA routing, serve index.html for non-asset requests
      const indexResponse = await c.env.ASSETS.fetch(new URL('/index.html', url.origin));
      if (indexResponse.status === 200) {
        return new Response(indexResponse.body, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          }
        });
      }
    }
    
    return response;
  } catch (error) {
    // Fallback HTML for SPA routing
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
    
    <!-- Performance hints -->
    <link rel="dns-prefetch" href="//images.pexels.com">
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });
  }
});

// Global error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  }, 500);
});

export default app;