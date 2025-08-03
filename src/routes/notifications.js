const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { 
  notificationQuerySchema,
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get notifications (admin only)
router.get('/', authenticateToken, requireAdmin, validateQuery(notificationQuerySchema), async (req, res) => {
  try {
    const { page, limit, read, type, sortBy, sortOrder } = req.validatedQuery;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (read !== undefined) where.read = read;
    if (type) where.type = type;

    // Build order by clause
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { read: false } })
    ]);

    res.json({
      success: true,
      data: {
        notifications: notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: notification.createdAt,
          read: notification.read,
          priority: notification.priority,
          data: notification.data
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch notifications'
      }
    });
  }
});

// Mark notification as read (admin only)
router.patch('/:id/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        id: notification.id,
        read: notification.read,
        readAt: notification.readAt
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark notification as read'
      }
    });
  }
});

// Mark all notifications as read (admin only)
router.patch('/read-all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        updatedCount: result.count,
        readAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark notifications as read'
      }
    });
  }
});

// Delete notification (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete notification'
      }
    });
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [total, unread, byType, byPriority] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: {
          type: true
        }
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        _count: {
          priority: true
        }
      })
    ]);

    const typeStats = {};
    byType.forEach(item => {
      typeStats[item.type] = item._count.type;
    });

    const priorityStats = {};
    byPriority.forEach(item => {
      priorityStats[item.priority] = item._count.priority;
    });

    res.json({
      success: true,
      data: {
        total,
        unread,
        read: total - unread,
        byType: typeStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch notification statistics'
      }
    });
  }
});

// Create notification (internal use - admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, title, message, priority, data } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Type, title, and message are required'
        }
      });
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        priority: priority || 'MEDIUM',
        data: data || null
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        read: notification.read,
        createdAt: notification.createdAt,
        data: notification.data
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create notification'
      }
    });
  }
});

module.exports = router; 