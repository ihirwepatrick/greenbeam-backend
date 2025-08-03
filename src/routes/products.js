const express = require('express');
const { 
  createProductSchema, 
  updateProductSchema,
  productQuerySchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin, optionalAuth } = require('../utils/auth');
const ProductController = require('../controllers/productController');

const router = express.Router();

// Get all products (public endpoint with optional auth)
router.get('/', optionalAuth, validateQuery(productQuerySchema), async (req, res) => {
  try {
    const result = await ProductController.getProducts(req.validatedQuery);
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get product by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const result = await ProductController.getProductById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching product:', error);
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

// Create new product (admin only)
router.post('/', authenticateToken, requireAdmin, validate(createProductSchema), async (req, res) => {
  try {
    const result = await ProductController.createProduct(req.validatedData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, validate(updateProductSchema), async (req, res) => {
  try {
    const result = await ProductController.updateProduct(req.params.id, req.validatedData);
    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
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

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await ProductController.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting product:', error);
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

// Get product categories (public endpoint)
router.get('/categories/list', async (req, res) => {
  try {
    const result = await ProductController.getProductCategories();
    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update product rating (public endpoint with optional auth)
router.post('/:id/rate', optionalAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    const result = await ProductController.updateProductRating(req.params.id, rating);
    res.json(result);
  } catch (error) {
    console.error('Error updating product rating:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: error.message
        }
      });
    }
    if (error.message === 'Rating must be between 1 and 5') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
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