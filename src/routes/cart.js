const express = require('express');
const { 
  addToCartSchema, 
  updateCartItemSchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const CartController = require('../controllers/cartController');

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Add item to cart
router.post('/add', validate(addToCartSchema), async (req, res) => {
  try {
    const { productId, quantity } = req.validatedData;
    const result = await CartController.addToCart(req.user.id, productId, quantity);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
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

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const result = await CartController.getUserCart(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update cart item quantity
router.put('/update/:productId', validate(updateCartItemSchema), async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.validatedData;
    const result = await CartController.updateCartItem(req.user.id, parseInt(productId), quantity);
    res.json(result);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Remove item from cart
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await CartController.removeFromCart(req.user.id, parseInt(productId));
    res.json(result);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Clear user's cart
router.delete('/clear', async (req, res) => {
  try {
    const result = await CartController.clearCart(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get cart item count
router.get('/count', async (req, res) => {
  try {
    const result = await CartController.getCartItemCount(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Check if product is in cart
router.get('/check/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await CartController.isProductInCart(req.user.id, parseInt(productId));
    res.json(result);
  } catch (error) {
    console.error('Error checking product in cart:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin: Get all carts
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await CartController.getAllCarts(parseInt(page), parseInt(limit), search);
    res.json(result);
  } catch (error) {
    console.error('Error fetching all carts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Admin: Get cart by user ID
router.get('/admin/user/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await CartController.getCartByUserId(userId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user cart:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Admin: Update cart item for any user
router.put('/admin/user/:userId/product/:productId', requireAdmin, validate(updateCartItemSchema), async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.validatedData;
    const result = await CartController.adminUpdateCartItem(userId, parseInt(productId), quantity);
    res.json(result);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Admin: Remove item from any user's cart
router.delete('/admin/user/:userId/product/:productId', requireAdmin, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const result = await CartController.adminRemoveFromCart(userId, parseInt(productId));
    res.json(result);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Admin: Clear any user's cart
router.delete('/admin/user/:userId/clear', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await CartController.adminClearCart(userId);
    res.json(result);
  } catch (error) {
    console.error('Error clearing user cart:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Admin: Get cart statistics
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const result = await CartController.getCartStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching cart stats:', error);
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
