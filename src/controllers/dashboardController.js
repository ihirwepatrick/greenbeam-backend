const prisma = require('../models');

class DashboardController {
  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      // Get current date and calculate date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Product statistics
      const [totalProducts, availableProducts, newProductsThisMonth, categories] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { status: 'AVAILABLE' } }),
        prisma.product.count({
          where: {
            createdAt: {
              gte: startOfMonth
            }
          }
        }),
        prisma.product.groupBy({
          by: ['category'],
          _count: {
            category: true
          }
        })
      ]);

      // Enquiry statistics
      const [totalEnquiries, newEnquiries, inProgressEnquiries, respondedEnquiries, closedEnquiries] = await Promise.all([
        prisma.enquiry.count(),
        prisma.enquiry.count({ where: { status: 'NEW' } }),
        prisma.enquiry.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.enquiry.count({ where: { status: 'RESPONDED' } }),
        prisma.enquiry.count({ where: { status: 'CLOSED' } })
      ]);

      // Calculate response rate
      const responseRate = totalEnquiries > 0 ? ((respondedEnquiries / totalEnquiries) * 100).toFixed(1) : 0;

      // Recent activity (last 7 days)
      const recentEnquiries = await prisma.enquiry.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const recentProducts = await prisma.product.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Notification statistics
      const [totalNotifications, unreadNotifications] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({ where: { read: false } })
      ]);

      // Email statistics
      const [totalEmails, sentEmails, failedEmails] = await Promise.all([
        prisma.emailLog.count(),
        prisma.emailLog.count({ where: { status: 'SENT' } }),
        prisma.emailLog.count({ where: { status: 'FAILED' } })
      ]);

      const emailSuccessRate = totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(1) : 0;

      // Category breakdown
      const categoryBreakdown = categories.map(cat => ({
        category: cat.category,
        count: cat._count.category
      }));

      // Priority breakdown for enquiries
      const priorityBreakdown = await prisma.enquiry.groupBy({
        by: ['priority'],
        _count: {
          priority: true
        }
      });

      const priorityStats = priorityBreakdown.map(p => ({
        priority: p.priority,
        count: p._count.priority
      }));

      // Recent enquiries for quick overview
      const recentEnquiryList = await prisma.enquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          product: true,
          status: true,
          priority: true,
          createdAt: true
        }
      });

      // System status (mock data - in real app, you'd check actual system status)
      const systemStatus = {
        status: 'online',
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Mock: 24 hours ago
        storageUsed: '2.3GB', // Mock data
        uptime: '99.9%' // Mock data
      };

      return {
        success: true,
        data: {
          products: {
            total: totalProducts,
            available: availableProducts,
            categories: categoryBreakdown.length,
            newThisMonth: newProductsThisMonth,
            categoryBreakdown
          },
          enquiries: {
            total: totalEnquiries,
            new: newEnquiries,
            inProgress: inProgressEnquiries,
            responded: respondedEnquiries,
            closed: closedEnquiries,
            responseRate: parseFloat(responseRate),
            priorityBreakdown: priorityStats,
            recent: recentEnquiries
          },
          notifications: {
            total: totalNotifications,
            unread: unreadNotifications,
            read: totalNotifications - unreadNotifications
          },
          emails: {
            total: totalEmails,
            sent: sentEmails,
            failed: failedEmails,
            successRate: parseFloat(emailSuccessRate)
          },
          activity: {
            recentEnquiries,
            recentProducts,
            recentEnquiryList: recentEnquiryList.map(enquiry => ({
              id: enquiry.id,
              customerName: enquiry.customerName,
              product: enquiry.product,
              status: enquiry.status,
              priority: enquiry.priority,
              createdAt: enquiry.createdAt
            }))
          },
          system: systemStatus
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  // Get chart data for analytics
  static async getChartData(period = 30) {
    try {
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Enquiries over time
      const enquiryData = await prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM enquiries 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      // Products by category
      const productCategoryData = await prisma.product.groupBy({
        by: ['category'],
        _count: {
          category: true
        }
      });

      // Enquiry status distribution
      const enquiryStatusData = await prisma.enquiry.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      // Priority distribution
      const priorityData = await prisma.enquiry.groupBy({
        by: ['priority'],
        _count: {
          priority: true
        }
      });

      // Email success rate over time
      const emailData = await prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
        FROM email_logs 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      return {
        success: true,
        data: {
          enquiriesOverTime: enquiryData,
          productCategories: productCategoryData.map(item => ({
            category: item.category,
            count: item._count.category
          })),
          enquiryStatus: enquiryStatusData.map(item => ({
            status: item.status,
            count: item._count.status
          })),
          priorityDistribution: priorityData.map(item => ({
            priority: item.priority,
            count: item._count.priority
          })),
          emailMetrics: emailData.map(item => ({
            date: item.date,
            total: parseInt(item.total),
            sent: parseInt(item.sent),
            failed: parseInt(item.failed),
            successRate: item.total > 0 ? ((item.sent / item.total) * 100).toFixed(1) : 0
          }))
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch chart data');
    }
  }

  // Get recent activity
  static async getRecentActivity(limit = 20) {
    try {
      // Get recent enquiries
      const recentEnquiries = await prisma.enquiry.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          responses: {
            take: 1,
            orderBy: { sentAt: 'desc' }
          }
        }
      });

      // Get recent products
      const recentProducts = await prisma.product.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      });

      // Get recent notifications
      const recentNotifications = await prisma.notification.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      });

      // Combine and sort all activities
      const activities = [
        ...recentEnquiries.map(enquiry => ({
          type: 'enquiry',
          id: enquiry.id,
          title: `New enquiry from ${enquiry.customerName}`,
          description: `Enquiry for ${enquiry.product}`,
          timestamp: enquiry.createdAt,
          data: {
            customerName: enquiry.customerName,
            product: enquiry.product,
            status: enquiry.status,
            priority: enquiry.priority
          }
        })),
        ...recentProducts.map(product => ({
          type: 'product',
          id: product.id,
          title: `New product: ${product.name}`,
          description: `Added to ${product.category} category`,
          timestamp: product.createdAt,
          data: {
            name: product.name,
            category: product.category,
            status: product.status
          }
        })),
        ...recentNotifications.map(notification => ({
          type: 'notification',
          id: notification.id,
          title: notification.title,
          description: notification.message,
          timestamp: notification.createdAt,
          data: {
            type: notification.type,
            priority: notification.priority,
            read: notification.read
          }
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

      return {
        success: true,
        data: {
          activities,
          summary: {
            totalEnquiries: recentEnquiries.length,
            totalProducts: recentProducts.length,
            totalNotifications: recentNotifications.length
          }
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch recent activity');
    }
  }
}

module.exports = DashboardController; 