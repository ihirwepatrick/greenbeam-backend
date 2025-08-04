/**
 * Enhanced Enquiry Controller
 * Demonstrates usage of the new model system for better structure and maintainability
 */

const { 
  EnquiryService, 
  ResponseModel, 
  ValidationModel 
} = require('../models');
const { 
  sendEnquiryConfirmation, 
  sendEnquiryResponse, 
  sendAdminNotification 
} = require('../utils/emailService');

class EnquiryControllerV2 {
  /**
   * Create a new enquiry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createEnquiry(req, res) {
    try {
      // Validation is handled by middleware, data is in req.validatedData
      const enquiryData = req.validatedData;

      // Use service layer for business logic
      const result = await EnquiryService.createEnquiry(enquiryData);

      // Send confirmation email to customer
      try {
        await sendEnquiryConfirmation(result.data);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }

      // Send notification email to admin
      try {
        await sendAdminNotification(result.data);
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the request if email fails
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create enquiry error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to create enquiry', 'ENQUIRY_CREATION_ERROR', 500)
      );
    }
  }

  /**
   * Get all enquiries with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getEnquiries(req, res) {
    try {
      // Validation is handled by middleware, query params are in req.validatedData
      const queryOptions = req.validatedData || {};

      // Use service layer for business logic
      const result = await EnquiryService.getEnquiries(queryOptions);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get enquiries error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to retrieve enquiries', 'ENQUIRY_RETRIEVAL_ERROR', 500)
      );
    }
  }

  /**
   * Get enquiry by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getEnquiryById(req, res) {
    try {
      // ID validation is handled by middleware, validated ID is in req.validatedId
      const enquiryId = req.validatedId;

      // Use service layer for business logic
      const result = await EnquiryService.getEnquiryById(enquiryId);

      // Check if enquiry was found
      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get enquiry by ID error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to retrieve enquiry', 'ENQUIRY_RETRIEVAL_ERROR', 500)
      );
    }
  }

  /**
   * Update enquiry status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateEnquiryStatus(req, res) {
    try {
      // Validation is handled by middleware
      const enquiryId = req.validatedId;
      const { status } = req.validatedData;

      // Use service layer for business logic
      const result = await EnquiryService.updateEnquiryStatus(enquiryId, status);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update enquiry status error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to update enquiry status', 'ENQUIRY_UPDATE_ERROR', 500)
      );
    }
  }

  /**
   * Respond to enquiry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async respondToEnquiry(req, res) {
    try {
      // Validation is handled by middleware
      const enquiryId = req.validatedId;
      const responseData = req.validatedData;
      const sentBy = req.user?.name || 'Admin'; // Get from authenticated user

      // Use service layer for business logic
      const result = await EnquiryService.respondToEnquiry(enquiryId, responseData, sentBy);

      // Send email response to customer if requested
      if (responseData.sendEmail !== false) {
        try {
          await sendEnquiryResponse(result.data);
        } catch (emailError) {
          console.error('Failed to send enquiry response email:', emailError);
          // Don't fail the request if email fails
        }
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Respond to enquiry error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to respond to enquiry', 'ENQUIRY_RESPONSE_ERROR', 500)
      );
    }
  }

  /**
   * Delete enquiry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteEnquiry(req, res) {
    try {
      // ID validation is handled by middleware
      const enquiryId = req.validatedId;

      // Check if enquiry exists
      const enquiry = await EnquiryService.getEnquiryById(enquiryId);
      if (!enquiry.success) {
        return res.status(404).json(enquiry);
      }

      // Delete enquiry and related responses
      await prisma.enquiryResponse.deleteMany({
        where: { enquiryId }
      });

      await prisma.enquiry.delete({
        where: { id: enquiryId }
      });

      return res.status(200).json(
        ResponseModel.success(null, 'Enquiry deleted successfully')
      );
    } catch (error) {
      console.error('Delete enquiry error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to delete enquiry', 'ENQUIRY_DELETION_ERROR', 500)
      );
    }
  }

  /**
   * Get enquiry statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getEnquiryStats(req, res) {
    try {
      const [
        totalEnquiries,
        newEnquiries,
        inProgressEnquiries,
        respondedEnquiries,
        closedEnquiries,
        highPriorityEnquiries
      ] = await Promise.all([
        prisma.enquiry.count(),
        prisma.enquiry.count({ where: { status: 'NEW' } }),
        prisma.enquiry.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.enquiry.count({ where: { status: 'RESPONDED' } }),
        prisma.enquiry.count({ where: { status: 'CLOSED' } }),
        prisma.enquiry.count({ where: { priority: 'HIGH' } })
      ]);

      const stats = {
        total: totalEnquiries,
        byStatus: {
          new: newEnquiries,
          inProgress: inProgressEnquiries,
          responded: respondedEnquiries,
          closed: closedEnquiries
        },
        highPriority: highPriorityEnquiries,
        responseRate: totalEnquiries > 0 ? ((respondedEnquiries / totalEnquiries) * 100).toFixed(1) : 0
      };

      return res.status(200).json(
        ResponseModel.success(stats, 'Enquiry statistics retrieved successfully')
      );
    } catch (error) {
      console.error('Get enquiry stats error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to retrieve enquiry statistics', 'STATS_RETRIEVAL_ERROR', 500)
      );
    }
  }

  /**
   * Bulk update enquiry status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async bulkUpdateStatus(req, res) {
    try {
      const { enquiryIds, status } = req.body;

      // Validate input
      if (!enquiryIds || !Array.isArray(enquiryIds) || enquiryIds.length === 0) {
        return res.status(400).json(
          ResponseModel.error('Enquiry IDs array is required', 'INVALID_INPUT', 400)
        );
      }

      // Validate status
      const statusValidation = ValidationModel.validateEnquiry({ status }, 'updateStatus');
      if (!statusValidation.isValid) {
        return res.status(400).json(statusValidation.formattedResponse);
      }

      // Update all enquiries
      const result = await prisma.enquiry.updateMany({
        where: {
          id: { in: enquiryIds }
        },
        data: { status }
      });

      return res.status(200).json(
        ResponseModel.success(
          { updatedCount: result.count },
          `Successfully updated ${result.count} enquiries`
        )
      );
    } catch (error) {
      console.error('Bulk update status error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to bulk update enquiry status', 'BULK_UPDATE_ERROR', 500)
      );
    }
  }

  /**
   * Export enquiries to CSV
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async exportEnquiries(req, res) {
    try {
      const queryOptions = req.validatedData || {};

      // Get all enquiries without pagination for export
      const enquiries = await prisma.enquiry.findMany({
        where: queryOptions.where || {},
        include: {
          responses: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Convert to CSV format
      const csvData = enquiries.map(enquiry => ({
        ID: enquiry.id,
        'Customer Name': enquiry.customerName,
        Email: enquiry.email,
        Phone: enquiry.phone || '',
        Product: enquiry.product,
        Subject: enquiry.subject,
        Message: enquiry.message,
        Status: enquiry.status,
        Priority: enquiry.priority,
        Source: enquiry.source,
        Location: enquiry.location || '',
        'Response Count': enquiry.responses.length,
        'Created At': enquiry.createdAt.toISOString(),
        'Updated At': enquiry.updatedAt.toISOString()
      }));

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=enquiries-${new Date().toISOString().split('T')[0]}.csv`);

      // Convert to CSV string
      const csvString = this.convertToCSV(csvData);

      return res.status(200).send(csvString);
    } catch (error) {
      console.error('Export enquiries error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to export enquiries', 'EXPORT_ERROR', 500)
      );
    }
  }

  /**
   * Convert data to CSV format
   * @param {Array} data - Array of objects
   * @returns {string} CSV string
   */
  static convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

module.exports = EnquiryControllerV2; 