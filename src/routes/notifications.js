const express = require('express');
const { 
  notificationQuerySchema,
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const NotificationController = require('../controllers/notificationController');

const router = express.Router();

// Get notifications (admin only)
router.get('/', authenticateToken, requireAdmin, validateQuery(notificationQuerySchema), async (req, res) => {
  try {
    const result = await NotificationController.getNotifications(req.validatedQuery);
    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Mark notification as read (admin only)
router.patch('/:id/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await NotificationController.markNotificationAsRead(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (error.message === 'Notification not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Mark all notifications as read (admin only)
router.patch('/read-all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await NotificationController.markAllNotificationsAsRead();
    res.json(result);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Delete notification (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await NotificationController.deleteNotification(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting notification:', error);
    if (error.message === 'Notification not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await NotificationController.getNotificationStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Create notification (internal use - admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await NotificationController.createNotification(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating notification:', error);
    if (error.message === 'Type, title, and message are required') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router; 