/**
 * Service Models
 * Business logic layer that handles complex operations and data processing
 */

const prisma = require('./index');
const { EnquiryDTO, ProductDTO, UserDTO, NotificationDTO, EmailLogDTO } = require('./DTOModel');
const ResponseModel = require('./ResponseModel');

class EnquiryService {
  /**
   * Create a new enquiry
   * @param {Object} data - Enquiry data
   * @returns {Promise<Object>} Created enquiry
   */
  static async createEnquiry(data) {
    try {
      const enquiryData = EnquiryDTO.fromRequest(data);
      const enquiry = await prisma.enquiry.create({
        data: enquiryData,
        include: {
          responses: true
        }
      });

      // Create notification for new enquiry
      await this.createEnquiryNotification(enquiry);

      return ResponseModel.success(
        EnquiryDTO.toResponse(enquiry),
        'Enquiry created successfully',
        201
      );
    } catch (error) {
      throw new Error(`Failed to create enquiry: ${error.message}`);
    }
  }

  /**
   * Get all enquiries with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated enquiries
   */
  static async getEnquiries(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { product: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [enquiries, total] = await Promise.all([
        prisma.enquiry.findMany({
          where,
          include: {
            responses: true
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: parseInt(limit)
        }),
        prisma.enquiry.count({ where })
      ]);

      return ResponseModel.paginated(
        EnquiryDTO.toResponseList(enquiries),
        page,
        limit,
        total,
        'Enquiries retrieved successfully'
      );
    } catch (error) {
      throw new Error(`Failed to retrieve enquiries: ${error.message}`);
    }
  }

  /**
   * Get enquiry by ID
   * @param {string} id - Enquiry ID
   * @returns {Promise<Object>} Enquiry details
   */
  static async getEnquiryById(id) {
    try {
      const enquiry = await prisma.enquiry.findUnique({
        where: { id },
        include: {
          responses: {
            orderBy: { sentAt: 'desc' }
          }
        }
      });

      if (!enquiry) {
        return ResponseModel.notFound('Enquiry', id);
      }

      return ResponseModel.success(
        EnquiryDTO.toResponse(enquiry),
        'Enquiry retrieved successfully'
      );
    } catch (error) {
      throw new Error(`Failed to retrieve enquiry: ${error.message}`);
    }
  }

  /**
   * Update enquiry status
   * @param {string} id - Enquiry ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated enquiry
   */
  static async updateEnquiryStatus(id, status) {
    try {
      const enquiry = await prisma.enquiry.update({
        where: { id },
        data: { status },
        include: {
          responses: true
        }
      });

      return ResponseModel.success(
        EnquiryDTO.toResponse(enquiry),
        'Enquiry status updated successfully'
      );
    } catch (error) {
      throw new Error(`Failed to update enquiry status: ${error.message}`);
    }
  }

  /**
   * Respond to enquiry
   * @param {string} id - Enquiry ID
   * @param {Object} data - Response data
   * @param {string} sentBy - User who sent the response
   * @returns {Promise<Object>} Created response
   */
  static async respondToEnquiry(id, data, sentBy) {
    try {
      const responseData = EnquiryResponseDTO.fromRequest(data, id, sentBy);
      
      const response = await prisma.enquiryResponse.create({
        data: responseData
      });

      // Update enquiry status to responded
      await prisma.enquiry.update({
        where: { id },
        data: { status: 'RESPONDED' }
      });

      return ResponseModel.success(
        EnquiryResponseDTO.toResponse(response),
        'Response sent successfully',
        201
      );
    } catch (error) {
      throw new Error(`Failed to respond to enquiry: ${error.message}`);
    }
  }

  /**
   * Create notification for new enquiry
   * @param {Object} enquiry - Enquiry object
   */
  static async createEnquiryNotification(enquiry) {
    try {
      await prisma.notification.create({
        data: {
          type: 'ENQUIRY',
          title: 'New Enquiry Received',
          message: `New enquiry from ${enquiry.customerName} regarding ${enquiry.product}`,
          priority: enquiry.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
          data: JSON.stringify({ enquiryId: enquiry.id })
        }
      });
    } catch (error) {
      console.error('Failed to create enquiry notification:', error);
    }
  }
}

class ProductService {
  /**
   * Create a new product
   * @param {Object} data - Product data
   * @returns {Promise<Object>} Created product
   */
  static async createProduct(data) {
    try {
      const productData = ProductDTO.fromRequest(data);
      const product = await prisma.product.create({
        data: productData
      });

      return ResponseModel.success(
        ProductDTO.toResponse(product),
        'Product created successfully',
        201
      );
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Get all products with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated products
   */
  static async getProducts(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (category) where.category = category;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: parseInt(limit)
        }),
        prisma.product.count({ where })
      ]);

      return ResponseModel.paginated(
        ProductDTO.toResponseList(products),
        page,
        limit,
        total,
        'Products retrieved successfully'
      );
    } catch (error) {
      throw new Error(`Failed to retrieve products: ${error.message}`);
    }
  }

  /**
   * Get product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product details
   */
  static async getProductById(id) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });

      if (!product) {
        return ResponseModel.notFound('Product', id);
      }

      return ResponseModel.success(
        ProductDTO.toResponse(product),
        'Product retrieved successfully'
      );
    } catch (error) {
      throw new Error(`Failed to retrieve product: ${error.message}`);
    }
  }

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated product
   */
  static async updateProduct(id, data) {
    try {
      const productData = ProductDTO.fromRequest(data);
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: productData
      });

      return ResponseModel.success(
        ProductDTO.toResponse(product),
        'Product updated successfully'
      );
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteProduct(id) {
    try {
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });

      return ResponseModel.success(
        null,
        'Product deleted successfully'
      );
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
}

class NotificationService {
  /**
   * Get all notifications with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated notifications
   */
  static async getNotifications(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        read,
        priority,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (type) where.type = type;
      if (read !== undefined) where.read = read;
      if (priority) where.priority = priority;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: parseInt(limit)
        }),
        prisma.notification.count({ where })
      ]);

      return ResponseModel.paginated(
        NotificationDTO.toResponseList(notifications),
        page,
        limit,
        total,
        'Notifications retrieved successfully'
      );
    } catch (error) {
      throw new Error(`Failed to retrieve notifications: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  static async markAsRead(id) {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return ResponseModel.success(
        NotificationDTO.toResponse(notification),
        'Notification marked as read'
      );
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Update result
   */
  static async markAllAsRead() {
    try {
      await prisma.notification.updateMany({
        where: { read: false },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return ResponseModel.success(
        null,
        'All notifications marked as read'
      );
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  /**
   * Get unread notification count
   * @returns {Promise<Object>} Count result
   */
  static async getUnreadCount() {
    try {
      const count = await prisma.notification.count({
        where: { read: false }
      });

      return ResponseModel.success(
        { count },
        'Unread notification count retrieved'
      );
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }
}

class DashboardService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard data
   */
  static async getDashboardStats() {
    try {
      const [
        totalEnquiries,
        newEnquiries,
        respondedEnquiries,
        totalProducts,
        availableProducts,
        totalNotifications,
        unreadNotifications
      ] = await Promise.all([
        prisma.enquiry.count(),
        prisma.enquiry.count({ where: { status: 'NEW' } }),
        prisma.enquiry.count({ where: { status: 'RESPONDED' } }),
        prisma.product.count(),
        prisma.product.count({ where: { status: 'AVAILABLE' } }),
        prisma.notification.count(),
        prisma.notification.count({ where: { read: false } })
      ]);

      // Get recent enquiries
      const recentEnquiries = await prisma.enquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          responses: true
        }
      });

      // Get recent notifications
      const recentNotifications = await prisma.notification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

      return ResponseModel.success({
        statistics: {
          enquiries: {
            total: totalEnquiries,
            new: newEnquiries,
            responded: respondedEnquiries
          },
          products: {
            total: totalProducts,
            available: availableProducts
          },
          notifications: {
            total: totalNotifications,
            unread: unreadNotifications
          }
        },
        recentEnquiries: EnquiryDTO.toResponseList(recentEnquiries),
        recentNotifications: NotificationDTO.toResponseList(recentNotifications)
      }, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error.message}`);
    }
  }
}

module.exports = {
  EnquiryService,
  ProductService,
  NotificationService,
  DashboardService
}; 