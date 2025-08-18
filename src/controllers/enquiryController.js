const prisma = require('../models');
const { sendEnquiryConfirmation, sendAdminNotification, sendEnquiryResponse } = require('../utils/emailService');

class EnquiryController {
  // Create new enquiry
  static async createEnquiry(enquiryData) {
    try {
      // Create enquiry in database
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

      // Send confirmation email (temporarily disabled due to SendGrid issues)
      try {
        await sendEnquiryConfirmation(enquiry);
      } catch (emailError) {
        console.warn('Email sending failed (disabled for now):', emailError.message);
        // Don't fail the enquiry creation if email fails
      }

      // Send admin notification (temporarily disabled due to SendGrid issues)
      try {
        await sendAdminNotification(enquiry);
      } catch (emailError) {
        console.warn('Admin notification failed (disabled for now):', emailError.message);
        // Don't fail the enquiry creation if email fails
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
          source: enquiry.source,
          location: enquiry.location,
          createdAt: enquiry.createdAt
        }
      };
    } catch (error) {
      throw new Error(`Failed to create enquiry: ${error.message}`);
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
          { email: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Build order by clause with whitelist to prevent invalid field errors
      const allowedSortFields = [
        'createdAt',
        'updatedAt',
        'customerName',
        'email',
        'status',
        'priority',
        'source'
      ];

      const orderBy = (() => {
        if (sortBy && allowedSortFields.includes(sortBy)) {
          return { [sortBy]: sortOrder || 'desc' };
        }
        return { createdAt: 'desc' };
      })();

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
            source: enquiry.source,
            location: enquiry.location,
            createdAt: enquiry.createdAt,
            updatedAt: enquiry.updatedAt,
            lastResponse: enquiry.responses[0] || null
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
      console.error('[ENQUIRIES] getEnquiries error:', error);
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
          source: enquiry.source,
          location: enquiry.location,
          createdAt: enquiry.createdAt,
          updatedAt: enquiry.updatedAt,
          responses: enquiry.responses
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
          updatedAt: enquiry.updatedAt
        }
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Enquiry not found');
      }
      throw new Error(`Failed to update enquiry status: ${error.message}`);
    }
  }

  // Respond to enquiry
  static async respondToEnquiry(id, responseData) {
    try {
      const enquiry = await prisma.enquiry.findUnique({
        where: { id }
      });

      if (!enquiry) {
        throw new Error('Enquiry not found');
      }

      // Create response (default emailSent to false; will update if email actually sent)
      const response = await prisma.enquiryResponse.create({
        data: {
          enquiryId: id,
          message: responseData.message,
          sentBy: responseData.sentBy || 'Admin',
          emailSent: false
        }
      });

      // If requested, attempt to send the email and update flag accordingly
      let emailWasSent = false;
      if (responseData.sendEmail) {
        try {
          await sendEnquiryResponse(enquiry, response.message);
          await prisma.enquiryResponse.update({
            where: { id: response.id },
            data: { emailSent: true }
          });
          emailWasSent = true;
        } catch (emailError) {
          console.warn('Failed to send enquiry response email:', emailError.message);
        }
      }

      // Update enquiry status to RESPONDED
      await prisma.enquiry.update({
        where: { id },
        data: { status: 'RESPONDED' }
      });

      return {
        success: true,
        data: {
          enquiryId: id,
          response: {
            id: response.id,
            message: response.message,
            sentBy: response.sentBy,
            sentAt: response.sentAt,
            emailSent: emailWasSent
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to respond to enquiry: ${error.message}`);
    }
  }
}

module.exports = EnquiryController; 