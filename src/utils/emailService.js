const sgMail = require('@sendgrid/mail');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email templates
const emailTemplates = {
  enquiry_confirmation: {
    subject: 'Enquiry Received - Greenbeam',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
  try {
    const { to, subject, body, type, template, data } = emailData;
    
    let emailSubject = subject;
    let emailBody = body;
    
    // Use template if provided
    if (template && emailTemplates[template]) {
      emailSubject = emailTemplates[template].subject;
      emailBody = emailTemplates[template].html(data);
    }
    
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME
      },
      subject: emailSubject,
      html: emailBody
    };
    
    // Send email via SendGrid
    const response = await sgMail.send(msg);
    
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
    console.error('Email sending failed:', error);
    
    // Log failed email to database
    try {
      await prisma.emailLog.create({
        data: {
          toEmail: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          type: emailData.type || 'general',
          status: 'FAILED'
        }
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
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