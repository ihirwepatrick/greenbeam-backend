/**
 * Enhanced Enquiry Routes
 * Demonstrates usage of the new model system and middleware
 */

const express = require('express');
const router = express.Router();

// Import middleware
const { 
  validateRequest, 
  validateId, 
  formatResponse, 
  errorHandler,
  requestLogger,
  authenticateToken,
  authorizeRoles 
} = require('../middleware/modelMiddleware');

// Import controller
const EnquiryControllerV2 = require('../controllers/enquiryControllerV2');

// Apply global middleware
router.use(formatResponse());
router.use(errorHandler());
router.use(requestLogger());

// Public routes (no authentication required)
router.post('/',
  validateRequest('enquiry', 'create'),
  EnquiryControllerV2.createEnquiry
);

// Protected routes (authentication required)
router.use(authenticateToken());

// Admin-only routes
router.get('/',
  validateRequest('query', 'pagination'),
  EnquiryControllerV2.getEnquiries
);

router.get('/stats',
  authorizeRoles('ADMIN'),
  EnquiryControllerV2.getEnquiryStats
);

router.get('/export',
  authorizeRoles('ADMIN'),
  validateRequest('query', 'pagination'),
  EnquiryControllerV2.exportEnquiries
);

router.post('/bulk-update',
  authorizeRoles('ADMIN'),
  EnquiryControllerV2.bulkUpdateStatus
);

// Routes with ID parameter
router.get('/:id',
  validateId('string'),
  EnquiryControllerV2.getEnquiryById
);

router.patch('/:id/status',
  validateId('string'),
  validateRequest('enquiry', 'updateStatus'),
  authorizeRoles('ADMIN'),
  EnquiryControllerV2.updateEnquiryStatus
);

router.post('/:id/respond',
  validateId('string'),
  validateRequest('enquiry', 'respond'),
  authorizeRoles('ADMIN'),
  EnquiryControllerV2.respondToEnquiry
);

router.delete('/:id',
  validateId('string'),
  authorizeRoles('ADMIN'),
  EnquiryControllerV2.deleteEnquiry
);

module.exports = router; 