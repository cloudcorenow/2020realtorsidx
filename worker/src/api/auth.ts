import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie } from 'hono/cookie';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  JWT_SECRET?: string;
};

const authRouter = new Hono<{ Bindings: Bindings }>();

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Sign up
authRouter.post('/signup', zValidator('json', signUpSchema), async (c) => {
  const { email, password, firstName, lastName, phone } = c.req.valid('json');
  
  try {
    // Check if user already exists
    const { results } = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).all();
    
    if (results.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }
    
    // Hash password (in production, use proper password hashing)
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const userId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(userId, email, hashedPassword, firstName || '', lastName || '', phone || '').run();
    
    // Generate JWT token
    const token = await sign(
      { 
        userId, 
        email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
      },
      c.env.JWT_SECRET || 'default-secret'
    );
    
    // Set HTTP-only cookie
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return c.json({
      user: {
        id: userId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
      },
      token,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Sign in
authRouter.post('/signin', zValidator('json', signInSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  try {
    // Get user from database
    const { results } = await c.env.DB.prepare(`
      SELECT id, email, password_hash, first_name, last_name, phone
      FROM users WHERE email = ?
    `).bind(email).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    const user = results[0] as any;
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate JWT token
    const token = await sign(
      { 
        userId: user.id, 
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
      },
      c.env.JWT_SECRET || 'default-secret'
    );
    
    // Set HTTP-only cookie
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Get current user
authRouter.get('/me', async (c) => {
  try {
    const token = getCookie(c, 'auth-token') || c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }
    
    const payload = await verify(token, c.env.JWT_SECRET || 'default-secret');
    
    // Get user from database
    const { results } = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, phone
      FROM users WHERE id = ?
    `).bind(payload.userId).all();
    
    if (results.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const user = results[0] as any;
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Sign out
authRouter.post('/signout', (c) => {
  setCookie(c, 'auth-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 0,
  });
  
  return c.json({ message: 'Signed out successfully' });
});

// Simple password hashing (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Simple password verification (use bcrypt in production)
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

export { authRouter };