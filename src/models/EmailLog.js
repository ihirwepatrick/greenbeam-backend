const prisma = require('./index');

class EmailLog {
  // Create new email log
  static async create(data) {
    return await prisma.emailLog.create({
      data
    });
  }

  // Find email log by ID
  static async findById(id) {
    return await prisma.emailLog.findUnique({
      where: { id }
    });
  }

  // Find all email logs with filters and pagination
  static async findAll(filters = {}) {
    const { page = 1, limit = 20, status, type, toEmail, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (toEmail) where.toEmail = toEmail;

    // Build order by clause
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.emailLog.count({ where })
    ]);

    return { logs, total };
  }

  // Update email log
  static async update(id, data) {
    return await prisma.emailLog.update({
      where: { id },
      data
    });
  }

  // Update email status
  static async updateStatus(id, status, sentAt = null) {
    const updateData = { status };
    if (sentAt) updateData.sentAt = sentAt;

    return await prisma.emailLog.update({
      where: { id },
      data: updateData
    });
  }

  // Delete email log
  static async delete(id) {
    return await prisma.emailLog.delete({
      where: { id }
    });
  }

  // Count email logs
  static async count(where = {}) {
    return await prisma.emailLog.count({ where });
  }

  // Count emails by status
  static async countByStatus(status) {
    return await prisma.emailLog.count({
      where: { status }
    });
  }

  // Count emails by type
  static async countByType(type) {
    return await prisma.emailLog.count({
      where: { type }
    });
  }

  // Get recent email logs
  static async getRecent(limit = 20) {
    return await prisma.emailLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get failed emails
  static async getFailed(limit = 20) {
    return await prisma.emailLog.findMany({
      where: { status: 'FAILED' },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get emails by status
  static async getByStatus(status, limit = 20) {
    return await prisma.emailLog.findMany({
      where: { status },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get emails by type
  static async getByType(type, limit = 20) {
    return await prisma.emailLog.findMany({
      where: { type },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get emails by recipient
  static async getByRecipient(toEmail, limit = 20) {
    return await prisma.emailLog.findMany({
      where: { toEmail },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get emails by date range
  static async getByDateRange(startDate, endDate) {
    return await prisma.emailLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Group emails by status
  static async groupByStatus() {
    return await prisma.emailLog.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
  }

  // Group emails by type
  static async groupByType() {
    return await prisma.emailLog.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });
  }

  // Get email statistics
  static async getStats() {
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
      total,
      sent,
      failed,
      pending,
      successRate: parseFloat(successRate),
      byType: typeStats,
      byStatus: statusStats
    };
  }

  // Get email metrics over time
  static async getMetricsOverTime(startDate, endDate) {
    return await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending
      FROM email_logs 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
  }

  // Delete old email logs
  static async deleteOld(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await prisma.emailLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
  }

  // Resend failed email
  static async resendFailed(id) {
    const emailLog = await prisma.emailLog.findUnique({
      where: { id }
    });

    if (!emailLog || emailLog.status !== 'FAILED') {
      throw new Error('Email log not found or not failed');
    }

    return emailLog;
  }
}

module.exports = EmailLog; 