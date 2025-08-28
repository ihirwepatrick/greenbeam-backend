const express = require('express');
const { 
  addToCartSchema, 
  updateCartItemSchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken } = require('../utils/auth');
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

module.exports = router;
