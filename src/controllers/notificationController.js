const prisma = require('../models');

class NotificationController {
  // Get notifications with filters and pagination
  static async getNotifications(filters) {
    try {
      const { page, limit, read, type, sortBy, sortOrder } = filters;
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

      return {
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
      };
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(id) {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return {
        success: true,
        data: {
          id: notification.id,
          read: notification.read,
          readAt: notification.readAt
        }
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Notification not found');
      }
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead() {
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

      return {
        success: true,
        data: {
          updatedCount: result.count,
          readAt: new Date()
        }
      };
    } catch (error) {
      throw new Error('Failed to mark notifications as read');
    }
  }

  // Delete notification
  static async deleteNotification(id) {
    try {
      await prisma.notification.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Notification not found');
      }
      throw new Error('Failed to delete notification');
    }
  }

  // Get notification statistics
  static async getNotificationStats() {
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

      return {
        success: true,
        data: {
          total,
          unread,
          read: total - unread,
          byType: typeStats,
          byPriority: priorityStats
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch notification statistics');
    }
  }

  // Create notification
  static async createNotification(notificationData) {
    try {
      const { type, title, message, priority, data } = notificationData;

      if (!type || !title || !message) {
        throw new Error('Type, title, and message are required');
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

      return {
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
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NotificationController; 