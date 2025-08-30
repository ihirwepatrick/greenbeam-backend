const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Enquiry {
  // Create new enquiry
  static async create(data) {
    return await prisma.enquiry.create({
      data
    });
  }

  // Find enquiry by ID
  static async findById(id) {
    return await prisma.enquiry.findUnique({
      where: { id },
      include: {
        responses: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });
  }

  // Find enquiry by ID without responses
  static async findByIdSimple(id) {
    return await prisma.enquiry.findUnique({
      where: { id }
    });
  }

  // Find all enquiries with filters and pagination
  static async findAll(filters = {}) {
    const { page = 1, limit = 10, search, status, priority, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { product: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          responses: {
            orderBy: { sentAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.enquiry.count({ where })
    ]);

    return { enquiries, total };
  }

  // Update enquiry
  static async update(id, data) {
    return await prisma.enquiry.update({
      where: { id },
      data
    });
  }

  // Update enquiry status
  static async updateStatus(id, status) {
    return await prisma.enquiry.update({
      where: { id },
      data: { status }
    });
  }

  // Delete enquiry
  static async delete(id) {
    return await prisma.enquiry.delete({
      where: { id }
    });
  }

  // Count enquiries
  static async count(where = {}) {
    return await prisma.enquiry.count({ where });
  }

  // Count enquiries by status
  static async countByStatus(status) {
    return await prisma.enquiry.count({
      where: { status }
    });
  }

  // Get recent enquiries
  static async getRecent(limit = 5) {
    return await prisma.enquiry.findMany({
      take: limit,
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
  }

  // Get enquiries by date range
  static async getByDateRange(startDate, endDate) {
    return await prisma.enquiry.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Group enquiries by status
  static async groupByStatus() {
    return await prisma.enquiry.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
  }

  // Group enquiries by priority
  static async groupByPriority() {
    return await prisma.enquiry.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    });
  }
}

module.exports = Enquiry; 