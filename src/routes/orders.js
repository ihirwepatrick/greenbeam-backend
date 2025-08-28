const express = require('express');
const { 
  createOrderSchema, 
  updateOrderStatusSchema,
  orderQuerySchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const OrderController = require('../controllers/orderController');

const router = express.Router();

// Create order from cart (authenticated users)
router.post('/create-from-cart', authenticateToken, validate(createOrderSchema), async (req, res) => {
  try {
    const result = await OrderController.createOrderFromCart(req.user.id, req.validatedData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating order from cart:', error);
    if (error.message === 'Cart is empty') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CART_EMPTY',
          message: error.message
        }
      });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: error.message
        }
      });
    }
    if (error.message.includes('not available')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_AVAILABLE',
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

// Create order with custom items (authenticated users)
router.post('/create', authenticateToken, validate(createOrderSchema), async (req, res) => {
  try {
    const result = await OrderController.createOrder(req.user.id, req.validatedData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: error.message
        }
      });
    }
    if (error.message.includes('not available')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_AVAILABLE',
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

// Get user's orders (authenticated users)
router.get('/my-orders', authenticateToken, validateQuery(orderQuerySchema), async (req, res) => {
  try {
    const result = await OrderController.getUserOrders(req.user.id, req.validatedQuery);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get order by ID (authenticated users - can only access their own orders)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await OrderController.getOrderById(req.params.id);
    
    // Check if user owns this order or is admin
    if (result.data.user.id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own orders'
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching order:', error);
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

// Get order by order number (public endpoint)
router.get('/number/:orderNumber', async (req, res) => {
  try {
    const result = await OrderController.getOrderByNumber(req.params.orderNumber);
    res.json(result);
  } catch (error) {
    console.error('Error fetching order by number:', error);
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

// Cancel order (authenticated users - can only cancel their own orders)
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const result = await OrderController.getOrderById(req.params.id);
    
    // Check if user owns this order or is admin
    if (result.data.user.id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only cancel your own orders'
        }
      });
    }
    
    const cancelResult = await OrderController.cancelOrder(req.params.id);
    res.json(cancelResult);
  } catch (error) {
    console.error('Error cancelling order:', error);
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

// Get order statistics (authenticated users - only their own stats)
router.get('/stats/my', authenticateToken, async (req, res) => {
  try {
    const result = await OrderController.getOrderStats(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Admin routes
// Get all orders (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, validateQuery(orderQuerySchema), async (req, res) => {
  try {
    const result = await OrderController.getAllOrders(req.validatedQuery);
    res.json(result);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update order status (admin only)
router.put('/admin/:id/status', authenticateToken, requireAdmin, validate(updateOrderStatusSchema), async (req, res) => {
  try {
    const { status } = req.validatedData;
    const result = await OrderController.updateOrderStatus(req.params.id, status);
    res.json(result);
  } catch (error) {
    console.error('Error updating order status:', error);
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

// Get all order statistics (admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await OrderController.getOrderStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching all order stats:', error);
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
