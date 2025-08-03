const prisma = require('../models');
const { 
  sendEnquiryConfirmation, 
  sendEnquiryResponse, 
  sendAdminNotification 
} = require('../utils/emailService');

class EnquiryController {
  // Create new enquiry
  static async createEnquiry(enquiryData) {
    try {
      // Create enquiry
      const enquiry = await prisma.enquiry.create({
        data: {
          customerName: enquiryData.customerName,
          email: enquiryData.email,
          phone: enquiryData.phone,
          product: enquiryData.product,
          subject: enquiryData.subject,
          message: enquiryData.message,
          source: enquiryData.source,
          location: enquiryData.location,
          priority: enquiryData.priority
        }
      });

      // Send confirmation email to customer
      try {
        await sendEnquiryConfirmation(enquiry);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      // Send notification email to admin
      try {
        await sendAdminNotification(enquiry);
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }

      // Create notification for admin dashboard
      try {
        await prisma.notification.create({
          data: {
            type: 'ENQUIRY',
            title: 'New Product Enquiry',
            message: `${enquiry.customerName} submitted an enquiry for ${enquiry.product}`,
            priority: enquiry.priority === 'High' ? 'HIGH' : 'MEDIUM',
            data: {
              enquiryId: enquiry.id,
              customerName: enquiry.customerName,
              product: enquiry.product
            }
          }
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }

      return {
        success: true,
        data: {
          id: enquiry.id,
          customerName: enquiry.customerName,
          email: enquiry.email,
          phone: enquiry.phone,
          product: enquiry.product,
          subject: enquiry.subject,
          message: enquiry.message,
          status: enquiry.status,
          priority: enquiry.priority,
          createdAt: enquiry.createdAt,
          lastUpdated: enquiry.updatedAt,
          source: enquiry.source,
          location: enquiry.location
        }
      };
    } catch (error) {
      throw new Error('Failed to create enquiry');
    }
  }

  // Get all enquiries with filters and pagination
  static async getEnquiries(filters) {
    try {
      const { page, limit, search, status, priority, sortBy, sortOrder } = filters;
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

      return {
        success: true,
        data: {
          enquiries: enquiries.map(enquiry => ({
            id: enquiry.id,
            customerName: enquiry.customerName,
            email: enquiry.email,
            phone: enquiry.phone,
            product: enquiry.product,
            subject: enquiry.subject,
            message: enquiry.message,
            status: enquiry.status,
            priority: enquiry.priority,
            createdAt: enquiry.createdAt,
            lastUpdated: enquiry.updatedAt,
            source: enquiry.source,
            location: enquiry.location
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch enquiries');
    }
  }

  // Get enquiry by ID
  static async getEnquiryById(id) {
    try {
      const enquiry = await prisma.enquiry.findUnique({
        where: { id },
        include: {
          responses: {
            orderBy: { sentAt: 'desc' }
          }
        }
      });

      if (!enquiry) {
        throw new Error('Enquiry not found');
      }

      return {
        success: true,
        data: {
          id: enquiry.id,
          customerName: enquiry.customerName,
          email: enquiry.email,
          phone: enquiry.phone,
          product: enquiry.product,
          subject: enquiry.subject,
          message: enquiry.message,
          status: enquiry.status,
          priority: enquiry.priority,
          createdAt: enquiry.createdAt,
          lastUpdated: enquiry.updatedAt,
          source: enquiry.source,
          location: enquiry.location,
          responses: enquiry.responses.map(response => ({
            id: response.id,
            message: response.message,
            sentAt: response.sentAt,
            sentBy: response.sentBy
          }))
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update enquiry status
  static async updateEnquiryStatus(id, status) {
    try {
      const enquiry = await prisma.enquiry.update({
        where: { id },
        data: { status }
      });

      return {
        success: true,
        data: {
          id: enquiry.id,
          status: enquiry.status,
          lastUpdated: enquiry.updatedAt
        }
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Enquiry not found');
      }
      throw new Error('Failed to update enquiry status');
    }
  }

  // Respond to enquiry
  static async respondToEnquiry(id, responseData, userEmail) {
    try {
      // Get enquiry
      const enquiry = await prisma.enquiry.findUnique({
        where: { id }
      });

      if (!enquiry) {
        throw new Error('Enquiry not found');
      }

      const { message, sendEmail } = responseData;

      // Create response
      const response = await prisma.enquiryResponse.create({
        data: {
          enquiryId: id,
          message,
          sentBy: userEmail,
          emailSent: sendEmail
        }
      });

      // Update enquiry status
      await prisma.enquiry.update({
        where: { id },
        data: { status: 'RESPONDED' }
      });

      // Send email if requested
      let emailResult = null;
      if (sendEmail) {
        try {
          emailResult = await sendEnquiryResponse(enquiry, message);
        } catch (emailError) {
          console.error('Failed to send response email:', emailError);
          // Update response to mark email as not sent
          await prisma.enquiryResponse.update({
            where: { id: response.id },
            data: { emailSent: false }
          });
        }
      }

      return {
        success: true,
        data: {
          responseId: response.id,
          enquiryId: response.enquiryId,
          message: response.message,
          emailSent: emailResult ? true : false,
          sentAt: response.sentAt
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete enquiry
  static async deleteEnquiry(id) {
    try {
      await prisma.enquiry.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Enquiry deleted successfully'
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Enquiry not found');
      }
      throw new Error('Failed to delete enquiry');
    }
  }
}

module.exports = EnquiryController; 