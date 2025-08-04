const express = require('express');
const { 
  createProductSchema, 
  updateProductSchema,
  productQuerySchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin, optionalAuth } = require('../utils/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const ProductController = require('../controllers/productController');

const router = express.Router();

// Test Supabase storage access
router.get('/test-storage', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'greenbeam';
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return res.json({
        success: false,
        data: { success: false, error: error.message },
        message: 'Storage access test failed'
      });
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    res.json({
      success: true,
      data: { 
        success: true, 
        accessible: true,
        bucketExists: bucketExists,
        bucketName: bucketName
      },
      message: 'Storage access test completed'
    });
  } catch (error) {
    console.error('Storage test error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STORAGE_TEST_ERROR',
        message: error.message
      }
    });
  }
});

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

// Create new product with images (admin only)
router.post('/', authenticateToken, requireAdmin, uploadMiddleware.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 9 }
]), async (req, res) => {
  try {
    // Validate product data
    const { error, value } = createProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details.map(detail => ({
            message: detail.message,
            path: detail.path,
            type: detail.type,
            context: detail.context
          }))
        },
        statusCode: 400
      });
    }

    // Prepare files object
    const files = {};
    if (req.files) {
      console.log('[ROUTE] Received files:', {
        fields: Object.keys(req.files),
        imageCount: req.files.image ? req.files.image.length : 0,
        imagesCount: req.files.images ? req.files.images.length : 0
      });
      
      // Handle main image
      if (req.files.image && req.files.image.length > 0) {
        files.image = req.files.image[0];
        console.log('[ROUTE] Main image file:', {
          originalname: files.image.originalname,
          hasSupabaseUrl: !!files.image.supabaseUrl,
          supabaseUrl: files.image.supabaseUrl
        });
      }
      
      // Handle additional images
      if (req.files.images && req.files.images.length > 0) {
        files.images = req.files.images;
        console.log('[ROUTE] Additional images:', files.images.map((file, index) => ({
          index,
          originalname: file.originalname,
          hasSupabaseUrl: !!file.supabaseUrl,
          supabaseUrl: file.supabaseUrl
        })));
      }
    } else {
      console.log('[ROUTE] No files received');
    }

    console.log('[ROUTE] Prepared files object:', {
      hasImage: !!files.image,
      hasImages: !!files.images,
      imagesCount: files.images ? files.images.length : 0
    });

    const result = await ProductController.createProduct(value, files);
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

// Update product with images (admin only)
router.put('/:id', authenticateToken, requireAdmin, uploadMiddleware.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 9 }
]), async (req, res) => {
  try {
    // Validate product data
    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details.map(detail => ({
            message: detail.message,
            path: detail.path,
            type: detail.type,
            context: detail.context
          }))
        },
        statusCode: 400
      });
    }

    // Prepare files object
    const files = {};
    if (req.files) {
      console.log('[ROUTE] Received files:', {
        fields: Object.keys(req.files),
        imageCount: req.files.image ? req.files.image.length : 0,
        imagesCount: req.files.images ? req.files.images.length : 0
      });
      
      // Handle main image
      if (req.files.image && req.files.image.length > 0) {
        files.image = req.files.image[0];
        console.log('[ROUTE] Main image file:', {
          originalname: files.image.originalname,
          hasSupabaseUrl: !!files.image.supabaseUrl,
          supabaseUrl: files.image.supabaseUrl
        });
      }
      
      // Handle additional images
      if (req.files.images && req.files.images.length > 0) {
        files.images = req.files.images;
        console.log('[ROUTE] Additional images:', files.images.map((file, index) => ({
          index,
          originalname: file.originalname,
          hasSupabaseUrl: !!file.supabaseUrl,
          supabaseUrl: file.supabaseUrl
        })));
      }
    } else {
      console.log('[ROUTE] No files received');
    }

    console.log('[ROUTE] Prepared files object:', {
      hasImage: !!files.image,
      hasImages: !!files.images,
      imagesCount: files.images ? files.images.length : 0
    });

    const result = await ProductController.updateProduct(req.params.id, value, files);
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
router.get('/categories/all', async (req, res) => {
  try {
    const result = await ProductController.getProductCategories();
    res.json(result);
  } catch (error) {
    console.error('Error fetching product categories:', error);
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
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rating must be between 1 and 5'
        }
      });
    }

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