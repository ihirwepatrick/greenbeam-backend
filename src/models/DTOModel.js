/**
 * Data Transfer Object Models
 * Standardized data structures for API requests and responses
 */

class EnquiryDTO {
  /**
   * Create enquiry from request data
   * @param {Object} data - Request data
   * @returns {Object} Formatted enquiry data
   */
  static fromRequest(data) {
    return {
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      product: data.product,
      subject: data.subject,
      message: data.message,
      source: data.source || 'Website Form',
      location: data.location,
      priority: data.priority || 'MEDIUM'
    };
  }

  /**
   * Format enquiry for response
   * @param {Object} enquiry - Database enquiry object
   * @returns {Object} Formatted enquiry response
   */
  static toResponse(enquiry) {
    return {
      id: enquiry.id,
      customerName: enquiry.customerName,
      email: enquiry.email,
      phone: enquiry.phone,
      product: enquiry.product,
      subject: enquiry.subject,
      message: enquiry.message,
      status: enquiry.status,
      priority: enquiry.priority,
      source: enquiry.source,
      location: enquiry.location,
      createdAt: enquiry.createdAt,
      updatedAt: enquiry.updatedAt,
      responses: enquiry.responses ? enquiry.responses.map(EnquiryResponseDTO.toResponse) : []
    };
  }

  /**
   * Format enquiry list for response
   * @param {Array} enquiries - Array of enquiry objects
   * @returns {Array} Formatted enquiry list
   */
  static toResponseList(enquiries) {
    return enquiries.map(enquiry => ({
      id: enquiry.id,
      customerName: enquiry.customerName,
      email: enquiry.email,
      phone: enquiry.phone,
      product: enquiry.product,
      subject: enquiry.subject,
      status: enquiry.status,
      priority: enquiry.priority,
      source: enquiry.source,
      location: enquiry.location,
      createdAt: enquiry.createdAt,
      updatedAt: enquiry.updatedAt,
      responseCount: enquiry.responses ? enquiry.responses.length : 0
    }));
  }
}

class EnquiryResponseDTO {
  /**
   * Create enquiry response from request data
   * @param {Object} data - Request data
   * @param {string} enquiryId - Enquiry ID
   * @param {string} sentBy - User who sent the response
   * @returns {Object} Formatted enquiry response data
   */
  static fromRequest(data, enquiryId, sentBy) {
    return {
      enquiryId,
      message: data.message,
      sentBy,
      emailSent: data.sendEmail !== false
    };
  }

  /**
   * Format enquiry response for API response
   * @param {Object} response - Database response object
   * @returns {Object} Formatted response
   */
  static toResponse(response) {
    return {
      id: response.id,
      enquiryId: response.enquiryId,
      message: response.message,
      sentBy: response.sentBy,
      emailSent: response.emailSent,
      sentAt: response.sentAt
    };
  }
}

class ProductDTO {
  /**
   * Create product from request data
   * @param {Object} data - Request data
   * @returns {Object} Formatted product data
   */
  static fromRequest(data) {
    return {
      name: data.name,
      category: data.category,
      description: data.description,
      image: data.image,
      features: data.features ? JSON.stringify(data.features) : null,
      specifications: data.specifications ? JSON.stringify(data.specifications) : null,
      status: data.status || 'AVAILABLE',
      images: data.images ? JSON.stringify(data.images) : null
    };
  }

  /**
   * Format product for response
   * @param {Object} product - Database product object
   * @returns {Object} Formatted product response
   */
  static toResponse(product) {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      features: product.features ? JSON.parse(product.features) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      rating: parseFloat(product.rating),
      reviews: product.reviews,
      status: product.status,
      images: product.images ? JSON.parse(product.images) : [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  /**
   * Format product list for response
   * @param {Array} products - Array of product objects
   * @returns {Array} Formatted product list
   */
  static toResponseList(products) {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      rating: parseFloat(product.rating),
      reviews: product.reviews,
      status: product.status,
      createdAt: product.createdAt
    }));
  }
}

class UserDTO {
  /**
   * Create user from request data
   * @param {Object} data - Request data
   * @returns {Object} Formatted user data
   */
  static fromRequest(data) {
    return {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || 'ADMIN'
    };
  }

  /**
   * Format user for response (excluding password)
   * @param {Object} user - Database user object
   * @returns {Object} Formatted user response
   */
  static toResponse(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Format user for authentication response
   * @param {Object} user - Database user object
   * @param {string} token - JWT token
   * @returns {Object} Formatted auth response
   */
  static toAuthResponse(user, token) {
    return {
      user: this.toResponse(user),
      token,
      expiresIn: '24h'
    };
  }
}

class NotificationDTO {
  /**
   * Create notification from request data
   * @param {Object} data - Request data
   * @returns {Object} Formatted notification data
   */
  static fromRequest(data) {
    return {
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'MEDIUM',
      data: data.data ? JSON.stringify(data.data) : null
    };
  }

  /**
   * Format notification for response
   * @param {Object} notification - Database notification object
   * @returns {Object} Formatted notification response
   */
  static toResponse(notification) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      read: notification.read,
      data: notification.data ? JSON.parse(notification.data) : null,
      createdAt: notification.createdAt,
      readAt: notification.readAt
    };
  }

  /**
   * Format notification list for response
   * @param {Array} notifications - Array of notification objects
   * @returns {Array} Formatted notification list
   */
  static toResponseList(notifications) {
    return notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      read: notification.read,
      createdAt: notification.createdAt
    }));
  }
}

class EmailLogDTO {
  /**
   * Create email log from request data
   * @param {Object} data - Request data
   * @returns {Object} Formatted email log data
   */
  static fromRequest(data) {
    return {
      toEmail: data.toEmail,
      subject: data.subject,
      body: data.body,
      type: data.type,
      status: data.status || 'PENDING'
    };
  }

  /**
   * Format email log for response
   * @param {Object} emailLog - Database email log object
   * @returns {Object} Formatted email log response
   */
  static toResponse(emailLog) {
    return {
      id: emailLog.id,
      toEmail: emailLog.toEmail,
      subject: emailLog.subject,
      body: emailLog.body,
      type: emailLog.type,
      status: emailLog.status,
      sentAt: emailLog.sentAt,
      createdAt: emailLog.createdAt
    };
  }
}

module.exports = {
  EnquiryDTO,
  EnquiryResponseDTO,
  ProductDTO,
  UserDTO,
  NotificationDTO,
  EmailLogDTO
}; 