const express = require('express');
const { sendEmailSchema, validate } = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const EmailController = require('../controllers/emailController');

const router = express.Router();

// Send email (admin only)
router.post('/send', authenticateToken, requireAdmin, validate(sendEmailSchema), async (req, res) => {
  try {
    const result = await EmailController.sendEmail(req.validatedData);
    res.json(result);
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
    const result = await EmailController.getEmailLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get email statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await EmailController.getEmailStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Resend failed email (admin only)
router.post('/resend/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await EmailController.resendFailedEmail(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error resending email:', error);
    if (error.message === 'Email log not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EMAIL_LOG_NOT_FOUND',
          message: error.message
        }
      });
    }
    if (error.message === 'Only failed emails can be resent') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: error.message
        }
      });
    }
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
    
    const result = await EmailController.testEmailConfiguration(to);
    res.json(result);
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