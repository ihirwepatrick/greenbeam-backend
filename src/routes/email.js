const express = require('express');
const { sendEmail, getEmailLogs } = require('../utils/emailService');
const { sendEmailSchema, validate } = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');

const router = express.Router();

// Send email (admin only)
router.post('/send', authenticateToken, requireAdmin, validate(sendEmailSchema), async (req, res) => {
  try {
    const emailData = req.validatedData;
    
    const result = await sendEmail(emailData);
    
    res.json({
      success: true,
      data: {
        messageId: result.messageId,
        sentAt: result.sentAt,
        status: 'sent'
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: error.message
      }
    });
  }
});

// Get email logs (admin only)
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    const result = await getEmailLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type
    });
    
    res.json({
      success: true,
      data: {
        logs: result.logs.map(log => ({
          id: log.id,
          toEmail: log.toEmail,
          subject: log.subject,
          type: log.type,
          status: log.status,
          sentAt: log.sentAt,
          createdAt: log.createdAt
        })),
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch email logs'
      }
    });
  }
});

// Get email statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const [total, sent, failed, pending, byType, byStatus] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: 'SENT' } }),
      prisma.emailLog.count({ where: { status: 'FAILED' } }),
      prisma.emailLog.count({ where: { status: 'PENDING' } }),
      prisma.emailLog.groupBy({
        by: ['type'],
        _count: {
          type: true
        }
      }),
      prisma.emailLog.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      })
    ]);
    
    const typeStats = {};
    byType.forEach(item => {
      typeStats[item.type] = item._count.type;
    });
    
    const statusStats = {};
    byStatus.forEach(item => {
      statusStats[item.status] = item._count.status;
    });
    
    const successRate = total > 0 ? ((sent / total) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        total,
        sent,
        failed,
        pending,
        successRate: parseFloat(successRate),
        byType: typeStats,
        byStatus: statusStats
      }
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch email statistics'
      }
    });
  }
});

// Resend failed email (admin only)
router.post('/resend/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Get the failed email log
    const emailLog = await prisma.emailLog.findUnique({
      where: { id }
    });
    
    if (!emailLog) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EMAIL_LOG_NOT_FOUND',
          message: 'Email log not found'
        }
      });
    }
    
    if (emailLog.status !== 'FAILED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only failed emails can be resent'
        }
      });
    }
    
    // Prepare email data for resending
    const emailData = {
      to: emailLog.toEmail,
      subject: emailLog.subject,
      body: emailLog.body,
      type: emailLog.type
    };
    
    // Try to resend
    const result = await sendEmail(emailData);
    
    res.json({
      success: true,
      data: {
        originalId: id,
        messageId: result.messageId,
        sentAt: result.sentAt,
        status: 'resent'
      }
    });
  } catch (error) {
    console.error('Error resending email:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_RESEND_FAILED',
        message: error.message
      }
    });
  }
});

// Test email configuration (admin only)
router.post('/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email address is required'
        }
      });
    }
    
    const testEmailData = {
      to,
      subject: 'Test Email - Greenbeam API',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32;">Test Email</h2>
          <p>This is a test email from the Greenbeam API.</p>
          <p>If you received this email, the email configuration is working correctly.</p>
          <br>
          <p>Sent at: ${new Date().toISOString()}</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is a test email. Please do not reply.
          </p>
        </div>
      `,
      type: 'test'
    };
    
    const result = await sendEmail(testEmailData);
    
    res.json({
      success: true,
      data: {
        messageId: result.messageId,
        sentAt: result.sentAt,
        status: 'sent',
        message: 'Test email sent successfully'
      }
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_EMAIL_FAILED',
        message: error.message
      }
    });
  }
});

module.exports = router; 