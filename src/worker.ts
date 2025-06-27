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
  ASSETS: Fetcher;
  ENVIRONMENT?: string;
  IDX_API_KEY?: string;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS for API routes only
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'https://2020realtors.pages.dev', 'https://2020realtors.workers.dev'],
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
    timestamp: new Date().toISOString()
  });
});

// Serve static files and handle SPA routing
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  let path = url.pathname;
  
  // Skip API routes
  if (path.startsWith('/api/')) {
    return c.json({ error: 'Not found' }, 404);
  }
  
  try {
    // Try to serve the requested file
    if (path === '/') {
      path = '/index.html';
    }
    
    const response = await c.env.ASSETS.fetch(new Request(`${url.origin}${path}`));
    
    if (response.ok) {
      const newResponse = new Response(response.body, response);
      
      // Set appropriate cache headers
      if (path.includes('/assets/') || path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
        newResponse.headers.set('Cache-Control', 'public, max-age=31536000');
      } else {
        newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }
      
      return newResponse;
    }
    
    // For SPA routing, serve index.html for non-file requests
    if (!path.includes('.')) {
      const indexResponse = await c.env.ASSETS.fetch(new Request(`${url.origin}/index.html`));
      if (indexResponse.ok) {
        return new Response(indexResponse.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=0, must-revalidate'
          }
        });
      }
    }
    
    return c.json({ error: 'Not found' }, 404);
    
  } catch (error) {
    console.error('Asset serving error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;