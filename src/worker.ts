import { Hono } from 'hono';
import { cors } from 'hono/cors';

// API route handlers
import { propertiesRouter } from './api/properties';
import { idxRouter } from './api/idx';
import { authRouter } from './api/auth';
import { contactRouter } from './api/contact';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  ENVIRONMENT?: string;
  IDX_API_KEY?: string;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://2020realtors.pages.dev', 'https://realtors-api-final.workers.dev'],
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
    environment: c.env.ENVIRONMENT || 'unknown',
    version: '4.0.0'
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: '20/20 Realtors API Final',
    version: '4.0.0',
    endpoints: [
      '/api/health',
      '/api/properties',
      '/api/idx',
      '/api/auth',
      '/api/contact'
    ]
  });
});

// SPA fallback - serve index.html for non-API routes
// This is the key fix: serve HTML directly instead of using serveStatic
app.get('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ message: 'API endpoint not found' }, 404);
  }
  
  // Return the built index.html directly
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
    <script type="module" crossorigin src="https://2020realtors.pages.dev/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="https://2020realtors.pages.dev/assets/index.css">
  </body>
</html>`);
});

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong'
  }, 500);
});

export default app;