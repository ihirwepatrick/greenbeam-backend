/**
 * Standardized API Response Model
 * Ensures consistent response structure across all endpoints
 */
class ResponseModel {
  /**
   * Create a success response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Formatted success response
   */
  static success(data = null, message = 'Operation completed successfully', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {number} statusCode - HTTP status code
   * @param {any} details - Additional error details
   * @returns {Object} Formatted error response
   */
  static error(message = 'An error occurred', code = 'ERROR', statusCode = 500, details = null) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      },
      statusCode
    };
  }

  /**
   * Create a paginated response
   * @param {Array} data - Response data
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @param {string} message - Success message
   * @returns {Object} Formatted paginated response
   */
  static paginated(data, page, limit, total, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      timestamp: new Date().toISOString(),
      statusCode: 200
    };
  }

  /**
   * Create a validation error response
   * @param {Array} errors - Validation errors
   * @param {string} message - Error message
   * @returns {Object} Formatted validation error response
   */
  static validationError(errors, message = 'Validation failed') {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: errors,
        timestamp: new Date().toISOString()
      },
      statusCode: 400
    };
  }

  /**
   * Create a not found response
   * @param {string} resource - Resource name
   * @param {string} identifier - Resource identifier
   * @returns {Object} Formatted not found response
   */
  static notFound(resource = 'Resource', identifier = '') {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found${identifier ? `: ${identifier}` : ''}`,
        timestamp: new Date().toISOString()
      },
      statusCode: 404
    };
  }

  /**
   * Create an unauthorized response
   * @param {string} message - Error message
   * @returns {Object} Formatted unauthorized response
   */
  static unauthorized(message = 'Unauthorized access') {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
        timestamp: new Date().toISOString()
      },
      statusCode: 401
    };
  }

  /**
   * Create a forbidden response
   * @param {string} message - Error message
   * @returns {Object} Formatted forbidden response
   */
  static forbidden(message = 'Access forbidden') {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
        timestamp: new Date().toISOString()
      },
      statusCode: 403
    };
  }
}

module.exports = ResponseModel; 