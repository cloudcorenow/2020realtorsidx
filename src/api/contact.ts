import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  RESEND_API_KEY?: string;
};

const contactRouter = new Hono<{ Bindings: Bindings }>();

// Enhanced schemas with better validation messages
const contactSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  propertyId: z.string().optional(),
});

const tourRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  propertyId: z.string(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string(),
  message: z.string().optional(),
});

// Enhanced submit endpoint with detailed logging
contactRouter.post('/submit', zValidator('json', contactSchema), async (c) => {
  const formData = c.req.valid('json');
  const contactId = crypto.randomUUID();
  const createdAt = new Date().toISOString(); // Explicit timestamp

  try {
    console.log('Submission received:', { contactId, ...formData });

    // 1. Database Insert with Error Handling
    const insertResult = await c.env.DB.prepare(`
      INSERT INTO contact_submissions (
        id, name, email, phone, subject, message, property_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contactId,
      formData.name,
      formData.email,
      formData.phone || null, // Use NULL instead of empty string
      formData.subject,
      formData.message,
      formData.propertyId || null,
      createdAt
    ).run();

    if (!insertResult.success) {
      throw new Error(`Database insert failed: ${insertResult.error}`);
    }

    // 2. Verify the record exists
    const insertedRecord = await c.env.DB.prepare(
      `SELECT id FROM contact_submissions WHERE id = ?`
    ).bind(contactId).first();

    if (!insertedRecord) {
      throw new Error('Insert verification failed');
    }

    // 3. Email with Error Recovery
    let emailStatus = { sent: false, error: null };
    if (c.env.RESEND_API_KEY) {
      try {
        const emailResponse = await sendContactNotification(c.env.RESEND_API_KEY, {
          ...formData,
          submissionId: contactId,
          createdAt
        });

        emailStatus.sent = emailResponse.success;
        emailStatus.error = emailResponse.error;
      } catch (emailError) {
        console.error('Email failed:', emailError);
        emailStatus.error = emailError.message;
      }
    }

    return c.json({ 
      success: true,
      id: contactId,
      message: 'Submission successful',
      emailStatus
    });

  } catch (error) {
    console.error('Submission failed:', {
      error: error.message,
      stack: error.stack,
      formData
    });

    return c.json({
      success: false,
      error: 'Submission failed',
      details: error.message,
      submissionId: contactId
    }, 500);
  }
});

// Enhanced email function with better error handling
async function sendContactNotification(apiKey: string, formData: any) {
  try {
    console.log('Attempting to send email for submission:', formData.submissionId);

    const emailData = {
      from: 'noreply@2020realtors.com',
      to: ['info@2020realtors.com'],
      subject: `New Contact Submission: ${formData.subject.substring(0, 50)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2d3748;">New Contact Form Submission</h2>
          <p><strong>Submission ID:</strong> ${formData.submissionId}</p>
          <p><strong>Received:</strong> ${new Date(formData.createdAt).toLocaleString()}</p>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
          <p><strong>Subject:</strong> ${formData.subject}</p>
          <div style="background: #f7fafc; padding: 1rem; border-radius: 0.25rem;">
            <p><strong>Message:</strong></p>
            <p>${formData.message}</p>
          </div>
          ${formData.propertyId ? `
            <p style="margin-top: 1rem;">
              <strong>Property ID:</strong> ${formData.propertyId}
            </p>
          ` : ''}
        </div>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Resend API error:', responseData);
      throw new Error(responseData.message || 'Email sending failed');
    }

    return { success: true, id: responseData.id };

  } catch (error) {
    console.error('Email send failed:', error);
    return { 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ... (keep other endpoints the same but add similar error handling)

export { contactRouter };
