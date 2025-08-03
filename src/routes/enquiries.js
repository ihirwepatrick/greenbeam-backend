const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { 
  createEnquirySchema, 
  updateEnquiryStatusSchema, 
  respondToEnquirySchema,
  enquiryQuerySchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { 
  sendEnquiryConfirmation, 
  sendEnquiryResponse, 
  sendAdminNotification 
} = require('../utils/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// Create new enquiry (public endpoint)
router.post('/', validate(createEnquirySchema), async (req, res) => {
  try {
    const enquiryData = req.validatedData;
    
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

    res.status(201).json({
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
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create enquiry'
      }
    });
  }
});

// Get all enquiries (admin only)
router.get('/', authenticateToken, requireAdmin, validateQuery(enquiryQuerySchema), async (req, res) => {
  try {
    const { page, limit, search, status, priority, sortBy, sortOrder } = req.validatedQuery;
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

    res.json({
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
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch enquiries'
      }
    });
  }
});

// Get enquiry by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        responses: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENQUIRY_NOT_FOUND',
          message: 'Enquiry not found'
        }
      });
    }

    res.json({
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
    });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch enquiry'
      }
    });
  }
});

// Update enquiry status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, validate(updateEnquiryStatusSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.validatedData;

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      data: {
        id: enquiry.id,
        status: enquiry.status,
        lastUpdated: enquiry.updatedAt
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENQUIRY_NOT_FOUND',
          message: 'Enquiry not found'
        }
      });
    }

    console.error('Error updating enquiry status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update enquiry status'
      }
    });
  }
});

// Respond to enquiry (admin only)
router.post('/:id/respond', authenticateToken, requireAdmin, validate(respondToEnquirySchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sendEmail } = req.validatedData;

    // Get enquiry
    const enquiry = await prisma.enquiry.findUnique({
      where: { id }
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENQUIRY_NOT_FOUND',
          message: 'Enquiry not found'
        }
      });
    }

    // Create response
    const response = await prisma.enquiryResponse.create({
      data: {
        enquiryId: id,
        message,
        sentBy: req.user.email,
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

    res.json({
      success: true,
      data: {
        responseId: response.id,
        enquiryId: response.enquiryId,
        message: response.message,
        emailSent: emailResult ? true : false,
        sentAt: response.sentAt
      }
    });
  } catch (error) {
    console.error('Error responding to enquiry:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to respond to enquiry'
      }
    });
  }
});

// Delete enquiry (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.enquiry.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENQUIRY_NOT_FOUND',
          message: 'Enquiry not found'
        }
      });
    }

    console.error('Error deleting enquiry:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete enquiry'
      }
    });
  }
});

module.exports = router; 