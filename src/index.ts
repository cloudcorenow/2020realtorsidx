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
  ENVIRONMENT?: string;
  IDX_API_KEY?: string;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enhanced logger middleware with request IDs
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set('requestId', requestId);
  
  logger()(c, async () => {
    await next();
    console.log(`[${c.req.method}] ${c.req.path} - ${c.res.status} (${requestId})`);
  });
});

app.use('*', prettyJSON());

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://2020realtorsidx.pages.dev',
  'https://2020-realtors.pages.dev',
  'https://www.2020realtors.com',
  'https://2020realtors.com'
];

app.use('*', cors({
  origin: (origin) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return '*';
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposeHeaders: ['X-Request-ID', 'X-Response-Time'],
  credentials: true,
  maxAge: 86400,
}));

// Add response time header
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  c.header('X-Response-Time', `${ms}ms`);
});

// API Routes with versioning
const api = new Hono<{ Bindings: Bindings }>()
  .route('/properties', propertiesRouter)
  .route('/idx', idxRouter)
  .route('/auth', authRouter)
  .route('/contact', contactRouter);

app.route('/api/v1', api);

// Enhanced health check with DB connectivity test
app.get('/api/health', async (c) => {
  try {
    const dbTest = await c.env.DB.prepare('SELECT 1 as test').first();
    const cacheTest = await c.env.CACHE.put('healthcheck', Date.now().toString(), { expirationTtl: 10 });
    
    return c.json({ 
      status: 'healthy',
      services: {
        database: dbTest ? 'connected' : 'unavailable',
        cache: cacheTest ? 'connected' : 'unavailable',
        email: c.env.RESEND_API_KEY ? 'configured' : 'disabled'
      },
      timestamp: new Date().toISOString(),
      environment: c.env.ENVIRONMENT || 'production',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json({
      status: 'degraded',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Root endpoint with API documentation
app.get('/', (c) => {
  return c.json({
    message: '20/20 Realtors API',
    version: '1.0.0',
    documentation: 'https://docs.2020realtors.com',
    endpoints: {
      v1: '/api/v1',
      health: '/api/health',
      status: 'operational'
    },
    timestamp: new Date().toISOString()
  });
});

// Enhanced error handler
app.onError((err, c) => {
  const requestId = c.get('requestId') || 'unknown';
  console.error(`[${requestId}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method
  });

  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong',
    requestId,
    timestamp: new Date().toISOString(),
    support: 'support@2020realtors.com'
  }, 500);
});

// 404 handler with suggested endpoints
app.notFound((c) => {
  return c.json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      '/api/v1/properties',
      '/api/v1/contact',
      '/api/v1/auth',
      '/api/health'
    ],
    timestamp: new Date().toISOString()
  }, 404);
});

export default app;
