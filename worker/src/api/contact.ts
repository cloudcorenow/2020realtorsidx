import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  RESEND_API_KEY?: string;
};

const contactRouter = new Hono<{ Bindings: Bindings }>();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  propertyId: z.string().optional(),
});

const tourRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  propertyId: z.string(),
  preferredDate: z.string(),
  preferredTime: z.string(),
  message: z.string().optional(),
});

// Submit contact form
contactRouter.post('/submit', zValidator('json', contactSchema), async (c) => {
  const formData = c.req.valid('json');
  
  try {
    // Save to database
    const contactId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO contact_submissions (
        id, name, email, phone, subject, message, property_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      contactId,
      formData.name,
      formData.email,
      formData.phone || '',
      formData.subject,
      formData.message,
      formData.propertyId || ''
    ).run();
    
    // Send email notification (if Resend API key is configured)
    if (c.env.RESEND_API_KEY) {
      await sendContactNotification(c.env.RESEND_API_KEY, formData);
    }
    
    return c.json({ 
      message: 'Contact form submitted successfully',
      id: contactId 
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return c.json({ error: 'Failed to submit contact form' }, 500);
  }
});

// Request property tour
contactRouter.post('/tour-request', zValidator('json', tourRequestSchema), async (c) => {
  const tourData = c.req.valid('json');
  
  try {
    // Save to database
    const requestId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO tour_requests (
        id, name, email, phone, property_id, preferred_date, preferred_time, message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      requestId,
      tourData.name,
      tourData.email,
      tourData.phone,
      tourData.propertyId,
      tourData.preferredDate,
      tourData.preferredTime,
      tourData.message || ''
    ).run();
    
    // Send email notification
    if (c.env.RESEND_API_KEY) {
      await sendTourRequestNotification(c.env.RESEND_API_KEY, tourData);
    }
    
    return c.json({ 
      message: 'Tour request submitted successfully',
      id: requestId 
    });
  } catch (error) {
    console.error('Tour request submission error:', error);
    return c.json({ error: 'Failed to submit tour request' }, 500);
  }
});

// Get contact submissions (admin only)
contactRouter.get('/submissions', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM contact_submissions 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all();
    
    return c.json({ submissions: results });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return c.json({ error: 'Failed to fetch contact submissions' }, 500);
  }
});

// Get tour requests (admin only)
contactRouter.get('/tour-requests', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT tr.*, p.title as property_title, p.address as property_address
      FROM tour_requests tr
      LEFT JOIN properties p ON tr.property_id = p.id
      ORDER BY tr.created_at DESC 
      LIMIT 100
    `).all();
    
    return c.json({ requests: results });
  } catch (error) {
    console.error('Error fetching tour requests:', error);
    return c.json({ error: 'Failed to fetch tour requests' }, 500);
  }
});

// Send contact notification email
async function sendContactNotification(apiKey: string, formData: any) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@2020realtors.com',
        to: ['info@2020realtors.com'],
        subject: `New Contact Form Submission: ${formData.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${formData.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${formData.message}</p>
          ${formData.propertyId ? `<p><strong>Property ID:</strong> ${formData.propertyId}</p>` : ''}
        `,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send contact notification email');
    }
  } catch (error) {
    console.error('Error sending contact notification email:', error);
  }
}

// Send tour request notification email
async function sendTourRequestNotification(apiKey: string, tourData: any) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@2020realtors.com',
        to: ['info@2020realtors.com'],
        subject: `New Property Tour Request`,
        html: `
          <h2>New Property Tour Request</h2>
          <p><strong>Name:</strong> ${tourData.name}</p>
          <p><strong>Email:</strong> ${tourData.email}</p>
          <p><strong>Phone:</strong> ${tourData.phone}</p>
          <p><strong>Property ID:</strong> ${tourData.propertyId}</p>
          <p><strong>Preferred Date:</strong> ${tourData.preferredDate}</p>
          <p><strong>Preferred Time:</strong> ${tourData.preferredTime}</p>
          ${tourData.message ? `<p><strong>Message:</strong> ${tourData.message}</p>` : ''}
        `,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send tour request notification email');
    }
  } catch (error) {
    console.error('Error sending tour request notification email:', error);
  }
}

export { contactRouter };