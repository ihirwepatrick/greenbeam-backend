const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { 
  createProductSchema, 
  updateProductSchema,
  productQuerySchema,
  validate, 
  validateQuery 
} = require('../utils/validation');
const { authenticateToken, requireAdmin, optionalAuth } = require('../utils/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products (public endpoint with optional auth)
router.get('/', optionalAuth, validateQuery(productQuerySchema), async (req, res) => {
  try {
    const { page, limit, search, category, status, sortBy, sortOrder } = req.validatedQuery;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          image: product.image,
          features: product.features,
          rating: product.rating,
          reviews: product.reviews,
          status: product.status,
          images: product.images,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
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
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch products'
      }
    });
  }
});

// Get product by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        image: product.image,
        features: product.features,
        specifications: product.specifications,
        rating: product.rating,
        reviews: product.reviews,
        status: product.status,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch product'
      }
    });
  }
});

// Create new product (admin only)
router.post('/', authenticateToken, requireAdmin, validate(createProductSchema), async (req, res) => {
  try {
    const productData = req.validatedData;

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        category: productData.category,
        description: productData.description,
        image: productData.image,
        features: productData.features,
        specifications: productData.specifications,
        status: productData.status,
        images: productData.images
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        image: product.image,
        features: product.features,
        specifications: product.specifications,
        rating: product.rating,
        reviews: product.reviews,
        status: product.status,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create product'
      }
    });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, validate(updateProductSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.validatedData;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: productData
    });

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        image: product.image,
        features: product.features,
        specifications: product.specifications,
        rating: product.rating,
        reviews: product.reviews,
        status: product.status,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update product'
      }
    });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete product'
      }
    });
  }
});

// Get product categories (public endpoint)
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    res.json({
      success: true,
      data: categories.map(cat => cat.category)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch categories'
      }
    });
  }
});

// Update product rating (public endpoint with optional auth)
router.post('/:id/rate', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
          message: 'Rating must be between 1 and 5'
        }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Calculate new average rating
    const newReviews = product.reviews + 1;
    const newRating = ((product.rating * product.reviews) + rating) / newReviews;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        rating: newRating,
        reviews: newReviews
      }
    });

    res.json({
      success: true,
      data: {
        id: updatedProduct.id,
        rating: updatedProduct.rating,
        reviews: updatedProduct.reviews
      }
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update product rating'
      }
    });
  }
});

module.exports = router; 