const express = require('express');
const { 
  createEnquirySchema, 
  updateEnquiryStatusSchema, 
  respondToEnquirySchema,
  enquiryQuerySchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const EnquiryController = require('../controllers/enquiryController');

const router = express.Router();

// Create new enquiry (public endpoint)
router.post('/', validate(createEnquirySchema), async (req, res) => {
  try {
    const result = await EnquiryController.createEnquiry(req.validatedData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get all enquiries (admin only)
router.get('/', authenticateToken, requireAdmin, validateQuery(enquiryQuerySchema), async (req, res) => {
  try {
    const result = await EnquiryController.getEnquiries(req.validatedQuery);
    res.json(result);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get enquiry by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await EnquiryController.getEnquiryById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    if (error.message === 'Enquiry not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENQUIRY_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update enquiry status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, validate(updateEnquiryStatusSchema), async (req, res) => {
  try {
    const result = await EnquiryController.updateEnquiryStatus(req.params.id, req.validatedData.status);
    res.json(result);
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    if (error.message === 'Enquiry not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENQUIRY_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Respond to enquiry (admin only)
router.post('/:id/respond', authenticateToken, requireAdmin, validate(respondToEnquirySchema), async (req, res) => {
  try {
    const result = await EnquiryController.respondToEnquiry(req.params.id, req.validatedData, req.user.email);
    res.json(result);
  } catch (error) {
    console.error('Error responding to enquiry:', error);
    if (error.message === 'Enquiry not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENQUIRY_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Delete enquiry (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await EnquiryController.deleteEnquiry(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    if (error.message === 'Enquiry not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENQUIRY_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router; 