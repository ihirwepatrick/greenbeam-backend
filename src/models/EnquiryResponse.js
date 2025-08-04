const prisma = require('./index');

class EnquiryResponse {
  // Create new enquiry response
  static async create(data) {
    return await prisma.enquiryResponse.create({
      data
    });
  }

  // Find response by ID
  static async findById(id) {
    return await prisma.enquiryResponse.findUnique({
      where: { id }
    });
  }

  // Find responses by enquiry ID
  static async findByEnquiryId(enquiryId) {
    return await prisma.enquiryResponse.findMany({
      where: { enquiryId },
      orderBy: { sentAt: 'desc' }
    });
  }

  // Find all responses with filters and pagination
  static async findAll(filters = {}) {
    const { page = 1, limit = 10, enquiryId, sentBy, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (enquiryId) where.enquiryId = enquiryId;
    if (sentBy) where.sentBy = sentBy;

    // Build order by clause
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.sentAt = 'desc';
    }

    const [responses, total] = await Promise.all([
      prisma.enquiryResponse.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          enquiry: {
            select: {
              id: true,
              customerName: true,
              product: true,
              subject: true
            }
          }
        }
      }),
      prisma.enquiryResponse.count({ where })
    ]);

    return { responses, total };
  }

  // Update response
  static async update(id, data) {
    return await prisma.enquiryResponse.update({
      where: { id },
      data
    });
  }

  // Update email sent status
  static async updateEmailSent(id, emailSent) {
    return await prisma.enquiryResponse.update({
      where: { id },
      data: { emailSent }
    });
  }

  // Delete response
  static async delete(id) {
    return await prisma.enquiryResponse.delete({
      where: { id }
    });
  }

  // Count responses
  static async count(where = {}) {
    return await prisma.enquiryResponse.count({ where });
  }

  // Count responses by enquiry ID
  static async countByEnquiryId(enquiryId) {
    return await prisma.enquiryResponse.count({
      where: { enquiryId }
    });
  }

  // Get recent responses
  static async getRecent(limit = 10) {
    return await prisma.enquiryResponse.findMany({
      take: limit,
      orderBy: { sentAt: 'desc' },
      include: {
        enquiry: {
          select: {
            id: true,
            customerName: true,
            product: true
          }
        }
      }
    });
  }

  // Get responses by date range
  static async getByDateRange(startDate, endDate) {
    return await prisma.enquiryResponse.findMany({
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { sentAt: 'desc' },
      include: {
        enquiry: {
          select: {
            id: true,
            customerName: true,
            product: true
          }
        }
      }
    });
  }

  // Get responses by sender
  static async getBySender(sentBy, limit = 10) {
    return await prisma.enquiryResponse.findMany({
      where: { sentBy },
      take: limit,
      orderBy: { sentAt: 'desc' },
      include: {
        enquiry: {
          select: {
            id: true,
            customerName: true,
            product: true
          }
        }
      }
    });
  }
}

module.exports = EnquiryResponse; 