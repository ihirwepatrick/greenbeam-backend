const prisma = require('../models');
const { sendEmail, getEmailLogs } = require('../utils/emailService');

class EmailController {
  // Send email
  static async sendEmail(emailData) {
    try {
      const result = await sendEmail(emailData);
      
      return {
        success: true,
        data: {
          messageId: result.messageId,
          sentAt: result.sentAt,
          status: 'sent'
        }
      };
    } catch (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // Get email logs
  static async getEmailLogs(filters) {
    try {
      const { page = 1, limit = 20, status, type } = filters;
      
      const result = await getEmailLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        type
      });
      
      return {
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
      };
    } catch (error) {
      throw new Error('Failed to fetch email logs');
    }
  }

  // Get email statistics
  static async getEmailStats() {
    try {
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
      
      return {
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
      };
    } catch (error) {
      throw new Error('Failed to fetch email statistics');
    }
  }

  // Resend failed email
  static async resendFailedEmail(id) {
    try {
      // Get the failed email log
      const emailLog = await prisma.emailLog.findUnique({
        where: { id }
      });
      
      if (!emailLog) {
        throw new Error('Email log not found');
      }
      
      if (emailLog.status !== 'FAILED') {
        throw new Error('Only failed emails can be resent');
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
      
      return {
        success: true,
        data: {
          originalId: id,
          messageId: result.messageId,
          sentAt: result.sentAt,
          status: 'resent'
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Test email configuration
  static async testEmailConfiguration(to) {
    try {
      if (!to) {
        throw new Error('Email address is required');
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
      
      return {
        success: true,
        data: {
          messageId: result.messageId,
          sentAt: result.sentAt,
          status: 'sent',
          message: 'Test email sent successfully'
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmailController; 