const prisma = require('../models');

class ProductController {
  // Get all products with filters and pagination
  static async getProducts(filters) {
    try {
      const { page, limit, search, category, status, sortBy, sortOrder } = filters;
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

      return {
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
      };
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return {
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
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new product
  static async createProduct(productData) {
    try {
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

      return {
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
      };
    } catch (error) {
      throw new Error('Failed to create product');
    }
  }

  // Update product
  static async updateProduct(id, productData) {
    try {
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: productData
      });

      return {
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
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Product not found');
      }
      throw new Error('Failed to update product');
    }
  }

  // Delete product
  static async deleteProduct(id) {
    try {
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Product not found');
      }
      throw new Error('Failed to delete product');
    }
  }

  // Get product categories
  static async getProductCategories() {
    try {
      const categories = await prisma.product.findMany({
        select: {
          category: true
        },
        distinct: ['category']
      });

      return {
        success: true,
        data: categories.map(cat => cat.category)
      };
    } catch (error) {
      throw new Error('Failed to fetch categories');
    }
  }

  // Update product rating
  static async updateProductRating(id, rating) {
    try {
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });

      if (!product) {
        throw new Error('Product not found');
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

      return {
        success: true,
        data: {
          id: updatedProduct.id,
          rating: updatedProduct.rating,
          reviews: updatedProduct.reviews
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductController; 