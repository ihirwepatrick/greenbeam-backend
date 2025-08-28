const express = require('express');
const { 
  createPaymentSchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const PaymentController = require('../controllers/paymentController');

const router = express.Router();

// Create payment (authenticated users)
router.post('/create', authenticateToken, validate(createPaymentSchema), async (req, res) => {
  try {
    const result = await PaymentController.createPayment(req.validatedData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating payment:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
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

// Process Stripe payment (authenticated users)
router.post('/stripe/process', authenticateToken, validate(createPaymentSchema), async (req, res) => {
  try {
    const result = await PaymentController.processStripePayment(req.validatedData);
    res.json(result);
  } catch (error) {
    console.error('Error processing Stripe payment:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
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

// Get payment by ID (authenticated users - can only access their own payments)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await PaymentController.getPaymentById(req.params.id);
    
    // Check if user owns this payment or is admin
    if (result.data.order.user.id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own payments'
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching payment:', error);
    if (error.message === 'Payment not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
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

// Get payments by order ID (authenticated users - can only access their own payments)
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const result = await PaymentController.getPaymentsByOrderId(req.params.orderId);
    
    // Check if user owns this order or is admin
    if (result.data.payments.length > 0 && 
        result.data.payments[0].order.user.id !== req.user.id && 
        req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own payments'
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching payments by order:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get payment by transaction ID (public endpoint)
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const result = await PaymentController.getPaymentByTransactionId(req.params.transactionId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching payment by transaction ID:', error);
    if (error.message === 'Payment not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
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

// Update payment status (admin only)
router.put('/admin/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required'
        }
      });
    }
    
    const result = await PaymentController.updatePaymentStatus(req.params.id, status, transactionId);
    res.json(result);
  } catch (error) {
    console.error('Error updating payment status:', error);
    if (error.message === 'Payment not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
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

// Process refund (admin only)
router.post('/admin/:id/refund', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { refundAmount, reason } = req.body;
    
    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid refund amount is required'
        }
      });
    }
    
    const result = await PaymentController.processRefund(req.params.id, refundAmount, reason);
    res.json(result);
  } catch (error) {
    console.error('Error processing refund:', error);
    if (error.message === 'Payment not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: error.message
        }
      });
    }
    if (error.message.includes('must be completed')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYMENT_STATUS',
          message: error.message
        }
      });
    }
    if (error.message.includes('cannot exceed')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REFUND_AMOUNT',
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

// Get all payments (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, validateQuery(orderQuerySchema), async (req, res) => {
  try {
    const result = await PaymentController.getAllPayments(req.validatedQuery);
    res.json(result);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get payment statistics (admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await PaymentController.getPaymentStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Stripe webhook endpoint (public endpoint)
router.post('/stripe/webhook', async (req, res) => {
  try {
    // This is a placeholder for Stripe webhook handling
    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Handle different event types (payment_intent.succeeded, payment_intent.payment_failed, etc.)
    // 3. Update payment and order status accordingly
    
    const { type, data } = req.body;
    
    console.log('Stripe webhook received:', { type, data });
    
    // For now, just acknowledge the webhook
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'WEBHOOK_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;
