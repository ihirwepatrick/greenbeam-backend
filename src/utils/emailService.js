const sgMail = require('@sendgrid/mail');
const prisma = require('../models');
const https = require('https');
const http = require('http');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email configuration flags
const EMAIL_ENABLED = process.env.EMAIL_ENABLED !== 'false';
const SENDGRID_SANDBOX = process.env.SENDGRID_SANDBOX === 'true';
const EMAIL_MAX_RETRIES = parseInt(process.env.EMAIL_MAX_RETRIES || '3', 10);
const EMAIL_RETRY_BASE_MS = parseInt(process.env.EMAIL_RETRY_BASE_MS || '500', 10); // exponential backoff base
const EMAIL_FAIL_SILENTLY = process.env.EMAIL_FAIL_SILENTLY === 'true' || process.env.NODE_ENV !== 'production';
const INLINE_LOGO_URL = process.env.EMAIL_INLINE_LOGO_URL; // optional: fetch and embed as CID

// Simple HTML to text fallback
const htmlToText = (html) => {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
};

// Fetch a URL and return base64 content and content-type
const fetchUrlAsBase64 = (url) => new Promise((resolve, reject) => {
  const client = url.startsWith('https') ? https : http;
  client.get(url, (res) => {
    if (res.statusCode !== 200) {
      return reject(new Error(`Failed to fetch ${url}: HTTP ${res.statusCode}`));
    }
    const chunks = [];
    res.on('data', (d) => chunks.push(d));
    res.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const contentType = res.headers['content-type'] || 'image/png';
      resolve({ base64: buffer.toString('base64'), contentType });
    });
  }).on('error', reject);
});

// Utility helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isTransientNetworkError = (error) => {
  const transientCodes = new Set([
    'EAI_AGAIN', // DNS lookup timeout
    'ENOTFOUND', // DNS host not found
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNABORTED', // axios timeout
    'ENETUNREACH',
    'EHOSTUNREACH'
  ]);
  const code = error?.code || error?.cause?.code;
  return code && transientCodes.has(code);
};

// Email templates
const emailTemplates = {
  enquiry_confirmation: {
    subject: 'Enquiry Received - Greenbeam',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://res.cloudinary.com/dfonqyqm3/image/upload/v1755127050/GREENBEAM_15_09_2021_logo_R91-01_hpirqf.jpg" alt="Greenbeam Logo" width="100" height="100" style="display:block; margin-bottom: 20px; border:0; outline:none; text-decoration:none;">
        <h2 style="color: #2E7D32;">Thank you for your enquiry!</h2>
        <p>Dear ${data.customerName},</p>
        <p>We have received your enquiry regarding <strong>${data.productName}</strong>.</p>
        <p>Your enquiry reference number is: <strong>${data.enquiryId}</strong></p>
        <p>Our team will review your request and get back to you within 24-48 hours.</p>
        <p>If you have any urgent questions, please don't hesitate to contact us directly.</p>
        <br>
        <p>Best regards,<br>The Greenbeam Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This is an automated response. Please do not reply to this email.
        </p>
      </div>
    `
  },
  enquiry_response: {
    subject: 'Response to your enquiry - Greenbeam',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://res.cloudinary.com/dfonqyqm3/image/upload/v1755127050/GREENBEAM_15_09_2021_logo_R91-01_hpirqf.jpg" alt="Greenbeam Logo" width="100" height="100" style="display:block; margin-bottom: 20px; border:0; outline:none; text-decoration:none;">
        <h2 style="color: #2E7D32;">Response to your enquiry</h2>
        <p>Dear ${data.customerName},</p>
        <p>Thank you for your enquiry regarding <strong>${data.productName}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2E7D32; margin: 20px 0;">
          ${data.message}
        </div>
        <p>If you have any further questions, please feel free to reply to this email.</p>
        <br>
        <p>Best regards,<br>The Greenbeam Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Enquiry ID: ${data.enquiryId}
        </p>
      </div>
    `
  },
  admin_notification: {
    subject: 'New Product Enquiry - Greenbeam',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D32F2F;">New Product Enquiry</h2>
        <p>A new enquiry has been submitted:</p>
        <ul>
          <li><strong>Customer:</strong> ${data.customerName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Product:</strong> ${data.productName}</li>
          <li><strong>Subject:</strong> ${data.subject}</li>
          <li><strong>Priority:</strong> ${data.priority}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #D32F2F;">
          ${data.message}
        </div>
        <p>Please respond to this enquiry as soon as possible.</p>
      </div>
    `
  }
};

// Send email function
const sendEmail = async (emailData) => {
  const { to, subject, body, type, template, data } = emailData;
  
  let emailSubject = subject;
  let emailBody = body;
  
  try {
    if (!EMAIL_ENABLED) {
      throw new Error('Email sending disabled by EMAIL_ENABLED=false');
    }
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('Email not configured: missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL');
    }
    
    // Use template if provided
    if (template && emailTemplates[template]) {
      emailSubject = emailTemplates[template].subject;
      emailBody = emailTemplates[template].html(data);
    }
    
    const attachments = [];
    // Optionally embed logo inline via CID:logo
    if (INLINE_LOGO_URL) {
      try {
        const { base64, contentType } = await fetchUrlAsBase64(INLINE_LOGO_URL);
        attachments.push({
          content: base64,
          filename: 'logo',
          type: contentType,
          disposition: 'inline',
          contentId: 'logo'
        });
        // Replace any existing Cloudinary/logo src with cid:logo
        emailBody = emailBody.replace(/src="https?:\/\/[^"']+\/GREENBEAM_15_09_2021_logo[^"']+"/i, 'src="cid:logo"');
      } catch (e) {
        console.warn('Failed to embed inline logo, using remote URL:', e.message);
      }
    }

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME
      },
      replyTo: process.env.SENDGRID_REPLY_TO || process.env.SENDGRID_FROM_EMAIL,
      subject: emailSubject,
      html: emailBody,
      text: htmlToText(emailBody),
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: true }
      },
      mailSettings: {
        sandboxMode: { enable: SENDGRID_SANDBOX }
      },
      categories: type ? [String(type)] : undefined,
      attachments: attachments.length ? attachments : undefined
    };

    // Send email via SendGrid with retry for transient DNS/network errors
    let response;
    let attempt = 0;
    let lastError;
    while (attempt <= EMAIL_MAX_RETRIES) {
      try {
        response = await sgMail.send(msg);
        lastError = undefined;
        break;
      } catch (sendError) {
        lastError = sendError;
        if (isTransientNetworkError(sendError) && attempt < EMAIL_MAX_RETRIES) {
          const delay = EMAIL_RETRY_BASE_MS * Math.pow(2, attempt);
          console.warn(`[EMAIL] Transient error (${sendError.code || sendError.message}). Retrying in ${delay}ms... (attempt ${attempt + 1}/${EMAIL_MAX_RETRIES})`);
          await sleep(delay);
          attempt += 1;
          continue;
        }
        // Non-transient or retries exhausted
        throw sendError;
      }
    }
    
    // Log email to database
    await prisma.emailLog.create({
      data: {
        toEmail: to,
        subject: emailSubject,
        body: emailBody,
        type: type || 'general',
        status: 'SENT',
        sentAt: new Date()
      }
    });
    
    return {
      success: true,
      messageId: response[0]?.headers['x-message-id'] || 'unknown',
      sentAt: new Date()
    };
    
  } catch (error) {
    // Sanitize logs to avoid leaking API keys or headers
    const safeLog = {
      message: error.message,
      code: error.code || error.cause?.code,
      responseStatus: error.response?.status,
      responseErrors: error.response?.body?.errors,
      hint: (error.code === 'ENOTFOUND' || error.cause?.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN' || error.cause?.code === 'EAI_AGAIN')
        ? 'DNS lookup failed or timed out for SendGrid host. Check internet connectivity, DNS, or proxy.'
        : undefined
    };
    console.error('Email sending failed:', safeLog);

    // Log failed email to database
    try {
      await prisma.emailLog.create({
        data: {
          toEmail: emailData.to,
          subject: emailSubject || emailData.subject || 'Email Subject Unavailable',
          body: emailBody || emailData.body || 'Email Body Unavailable',
          type: emailData.type || 'general',
          status: 'FAILED'
        }
      });
    } catch (logError) {
      console.error('Failed to log email error:', {
        message: logError.message,
        code: logError.code
      });
    }

    if (EMAIL_FAIL_SILENTLY && isTransientNetworkError(error)) {
      // In non-production or when configured, do not throw on transient network failures
      console.warn('[EMAIL] Transient network failure. Skipping email send (fail silently enabled).');
      return { success: false, skipped: true, reason: error.code || error.message };
    }

    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Send enquiry confirmation email
const sendEnquiryConfirmation = async (enquiry) => {
  const emailData = {
    to: enquiry.email,
    type: 'enquiry_confirmation',
    template: 'enquiry_confirmation',
    data: {
      customerName: enquiry.customerName,
      productName: enquiry.product,
      enquiryId: enquiry.id
    }
  };
  
  return await sendEmail(emailData);
};

// Send enquiry response email
const sendEnquiryResponse = async (enquiry, responseMessage) => {
  const emailData = {
    to: enquiry.email,
    type: 'enquiry_response',
    template: 'enquiry_response',
    data: {
      customerName: enquiry.customerName,
      productName: enquiry.product,
      message: responseMessage,
      enquiryId: enquiry.id
    }
  };
  
  return await sendEmail(emailData);
};

// Send admin notification email
const sendAdminNotification = async (enquiry) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('Admin email not configured, skipping admin notification');
    return null;
  }
  
  const emailData = {
    to: adminEmail,
    type: 'admin_notification',
    template: 'admin_notification',
    data: {
      customerName: enquiry.customerName,
      email: enquiry.email,
      productName: enquiry.product,
      subject: enquiry.subject,
      message: enquiry.message,
      priority: enquiry.priority
    }
  };
  
  return await sendEmail(emailData);
};

// Get email logs
const getEmailLogs = async (filters = {}) => {
  const { page = 1, limit = 20, status, type } = filters;
  const skip = (page - 1) * limit;
  
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  
  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.emailLog.count({ where })
  ]);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  sendEmail,
  sendEnquiryConfirmation,
  sendEnquiryResponse,
  sendAdminNotification,
  getEmailLogs,
  emailTemplates
}; 