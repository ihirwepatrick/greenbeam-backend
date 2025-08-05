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

  // Create product with image upload
  static async createProduct(productData, files = {}) {
    try {
      let imageUrl = null;
      let imageUrls = [];

      console.log('[PRODUCT] Creating product with files:', {
        hasImage: !!files.image,
        hasImages: !!files.images,
        imagesCount: files.images ? files.images.length : 0
      });

      // Handle main image upload
      if (files.image && files.image.supabaseUrl) {
        imageUrl = files.image.supabaseUrl;
        console.log('[PRODUCT] Main image URL:', imageUrl);
      } else if (files.image) {
        console.log('[PRODUCT] Main image file exists but no supabaseUrl:', files.image);
      }

      // Handle additional images upload
      if (files.images && files.images.length > 0) {
        console.log('[PRODUCT] Processing additional images:', files.images.length);
        
        for (let i = 0; i < files.images.length; i++) {
          const file = files.images[i];
          console.log(`[PRODUCT] Image ${i + 1}:`, {
            originalname: file.originalname,
            hasSupabaseUrl: !!file.supabaseUrl,
            supabaseUrl: file.supabaseUrl
          });
          
          if (file.supabaseUrl) {
            imageUrls.push(file.supabaseUrl);
          } else {
            console.warn(`[PRODUCT] Image ${i + 1} missing supabaseUrl:`, file);
          }
        }
      }

      console.log('[PRODUCT] Final image URLs:', {
        mainImage: imageUrl,
        additionalImages: imageUrls,
        totalImages: imageUrls.length
      });

      // Create product in database
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          category: productData.category,
          description: productData.description,
          image: imageUrl,
          features: productData.features,
          specifications: productData.specifications,
          status: productData.status,
          images: imageUrls.length > 0 ? imageUrls : null
        }
      });

      console.log('[PRODUCT] Product created successfully with ID:', product.id);

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
      console.error('[PRODUCT] Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  // Update product with image upload
  static async updateProduct(id, productData, files = {}) {
    try {
      const existingProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingProduct) {
        throw new Error('Product not found');
      }

      console.log('[PRODUCT] Existing product images:', {
        mainImage: existingProduct.image,
        additionalImages: existingProduct.images,
        additionalImagesCount: existingProduct.images ? existingProduct.images.length : 0
      });

      let imageUrl = existingProduct.image;
      let imageUrls = existingProduct.images || [];

      console.log('[PRODUCT] Updating product with files:', {
        hasImage: !!files.image,
        hasImages: !!files.images,
        imagesCount: files.images ? files.images.length : 0,
        existingImagesCount: imageUrls.length
      });

      // Handle main image upload
      if (files.image && files.image.supabaseUrl) {
        imageUrl = files.image.supabaseUrl;
        console.log('[PRODUCT] Main image updated:', imageUrl);
      } else if (files.image) {
        console.log('[PRODUCT] Main image file exists but no supabaseUrl:', files.image);
      }

      // Handle additional images upload - REPLACE existing images
      if (files.images && files.images.length > 0) {
        console.log('[PRODUCT] Processing additional images for update:', files.images.length);
        
        const newImageUrls = [];
        for (let i = 0; i < files.images.length; i++) {
          const file = files.images[i];
          console.log(`[PRODUCT] Image ${i + 1}:`, {
            originalname: file.originalname,
            hasSupabaseUrl: !!file.supabaseUrl,
            supabaseUrl: file.supabaseUrl
          });
          
          if (file.supabaseUrl) {
            newImageUrls.push(file.supabaseUrl);
          } else {
            console.warn(`[PRODUCT] Image ${i + 1} missing supabaseUrl:`, file);
          }
        }
        
        // Replace existing images with new ones
        imageUrls = newImageUrls;
        console.log('[PRODUCT] Additional images replaced:', imageUrls);
      } else {
        console.log('[PRODUCT] No new additional images provided, keeping existing:', imageUrls);
      }

      console.log('[PRODUCT] Final image URLs for update:', {
        mainImage: imageUrl,
        additionalImages: imageUrls,
        totalImages: imageUrls.length
      });

      // Check if productData contains images field
      console.log('[PRODUCT] Product data from request:', {
        hasImagesField: 'images' in productData,
        imagesFieldValue: productData.images,
        allFields: Object.keys(productData)
      });

      // Prepare update data - explicitly exclude images from productData to avoid conflicts
      const { images: _, ...productDataWithoutImages } = productData;
      const updateData = {
        ...productDataWithoutImages,
        image: imageUrl,
        images: imageUrls // Always pass the array, even if empty
      };

      console.log('[PRODUCT] Database update data:', {
        image: updateData.image,
        images: updateData.images,
        imagesType: typeof updateData.images,
        imagesIsArray: Array.isArray(updateData.images),
        imagesLength: updateData.images ? updateData.images.length : 0,
        imagesJSON: JSON.stringify(updateData.images)
      });

      // Update product in database
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      console.log('[PRODUCT] Product updated successfully with ID:', product.id);
      console.log('[PRODUCT] Updated product images from database:', {
        mainImage: product.image,
        additionalImages: product.images,
        additionalImagesCount: product.images ? product.images.length : 0,
        additionalImagesType: typeof product.images,
        additionalImagesIsArray: Array.isArray(product.images)
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
      console.error('[PRODUCT] Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  // Delete product and associated images
  static async deleteProduct(id) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Note: In this implementation, we don't delete files from Supabase
      // as the upload middleware handles the file management
      // You can add file deletion logic here if needed

      // Delete product from database
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      if (error.message === 'Product not found') {
        throw error;
      }
      throw new Error(`Failed to delete product: ${error.message}`);
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
      throw new Error('Failed to fetch product categories');
    }
  }

  // Update product rating
  static async updateProductRating(id, rating) {
    try {
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
      throw new Error(`Failed to update product rating: ${error.message}`);
    }
  }
}

module.exports = ProductController; 