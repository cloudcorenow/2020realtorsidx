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
    version: '3.0.0'
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: '20/20 Realtors API Final',
    version: '3.0.0',
    endpoints: [
      '/api/health',
      '/api/properties',
      '/api/idx',
      '/api/auth',
      '/api/contact'
    ]
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
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