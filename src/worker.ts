import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
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
  origin: ['http://localhost:5173', 'https://2020-realtors.pages.dev'],
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

// Serve static React app
app.get('*', serveStatic({
  root: './',
  onNotFound: (path, c) => {
    // For client-side routing, serve index.html for non-API routes
    if (!path.startsWith('/api/')) {
      return c.env.ASSETS.fetch(new Request('http://localhost/index.html'));
    }
    throw new HTTPException(404, { message: 'Not Found' });
  },
}));

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