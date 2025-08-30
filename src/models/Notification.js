const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Notification {
  // Create new notification
  static async create(data) {
    return await prisma.notification.create({
      data
    });
  }

  // Find notification by ID
  static async findById(id) {
    return await prisma.notification.findUnique({
      where: { id }
    });
  }

  // Find all notifications with filters and pagination
  static async findAll(filters = {}) {
    const { page = 1, limit = 10, read, type, priority, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (read !== undefined) where.read = read;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    // Build order by clause
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return { notifications, total };
  }

  // Update notification
  static async update(id, data) {
    return await prisma.notification.update({
      where: { id },
      data
    });
  }

  // Mark notification as read
  static async markAsRead(id) {
    return await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date()
      }
    });
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    return await prisma.notification.updateMany({
      where: {
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });
  }

  // Delete notification
  static async delete(id) {
    return await prisma.notification.delete({
      where: { id }
    });
  }

  // Count notifications
  static async count(where = {}) {
    return await prisma.notification.count({ where });
  }

  // Count unread notifications
  static async countUnread() {
    return await prisma.notification.count({
      where: { read: false }
    });
  }

  // Count notifications by type
  static async countByType(type) {
    return await prisma.notification.count({
      where: { type }
    });
  }

  // Count notifications by priority
  static async countByPriority(priority) {
    return await prisma.notification.count({
      where: { priority }
    });
  }

  // Get recent notifications
  static async getRecent(limit = 10) {
    return await prisma.notification.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get unread notifications
  static async getUnread(limit = 10) {
    return await prisma.notification.findMany({
      where: { read: false },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get notifications by type
  static async getByType(type, limit = 10) {
    return await prisma.notification.findMany({
      where: { type },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get notifications by priority
  static async getByPriority(priority, limit = 10) {
    return await prisma.notification.findMany({
      where: { priority },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get notifications by date range
  static async getByDateRange(startDate, endDate) {
    return await prisma.notification.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Group notifications by type
  static async groupByType() {
    return await prisma.notification.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });
  }

  // Group notifications by priority
  static async groupByPriority() {
    return await prisma.notification.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    });
  }

  // Get notification statistics
  static async getStats() {
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
      total,
      unread,
      read: total - unread,
      byType: typeStats,
      byPriority: priorityStats
    };
  }

  // Delete old notifications
  static async deleteOld(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
  }
}

module.exports = Notification; 