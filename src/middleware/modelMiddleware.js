/**
 * Model Middleware
 * Middleware that integrates the new models for consistent API handling
 */

const { ValidationModel, ResponseModel } = require('../models');

/**
 * Validation middleware factory
 * Creates middleware for validating request data against schemas
 * @param {string} validationType - Type of validation to perform
 * @param {string} schemaType - Schema type to use
 * @returns {Function} Express middleware function
 */
const validateRequest = (validationType, schemaType) => {
  return (req, res, next) => {
    try {
      let validationResult;

      switch (validationType) {
        case 'enquiry':
          validationResult = ValidationModel.validateEnquiry(req.body, schemaType);
          break;
        case 'product':
          validationResult = ValidationModel.validateProduct(req.body, schemaType);
          break;
        case 'user':
          validationResult = ValidationModel.validateUser(req.body, schemaType);
          break;
        case 'notification':
          validationResult = ValidationModel.validateNotification(req.body);
          break;
        case 'email':
          validationResult = ValidationModel.validateEmail(req.body);
          break;
        case 'query':
          validationResult = ValidationModel.validateQuery(req.query);
          break;
        default:
          return res.status(400).json(
            ResponseModel.error('Invalid validation type', 'INVALID_VALIDATION_TYPE', 400)
          );
      }

      if (!validationResult.isValid) {
        return res.status(400).json(validationResult.formattedResponse);
      }

      // Attach validated data to request
      req.validatedData = validationResult.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json(
        ResponseModel.error('Validation error occurred', 'VALIDATION_ERROR', 500)
      );
    }
  };
};

/**
 * ID validation middleware
 * Validates and sanitizes ID parameters
 * @param {string} idType - Type of ID (string or number)
 * @returns {Function} Express middleware function
 */
const validateId = (idType = 'string') => {
  return (req, res, next) => {
    try {
      const id = req.params.id;
      const validationResult = ValidationModel.validateId(id, idType);

      if (!validationResult.isValid) {
        return res.status(400).json(validationResult.formattedResponse);
      }

      // Attach validated ID to request
      req.validatedId = validationResult.data;
      next();
    } catch (error) {
      console.error('ID validation middleware error:', error);
      return res.status(500).json(
        ResponseModel.error('ID validation error occurred', 'VALIDATION_ERROR', 500)
      );
    }
  };
};

/**
 * Response formatting middleware
 * Ensures all responses follow the standard format
 * @returns {Function} Express middleware function
 */
const formatResponse = () => {
  return (req, res, next) => {
    // Store original send method
    const originalSend = res.send;

    // Override send method to format responses
    res.send = function(data) {
      // If response is already formatted, send as is
      if (data && typeof data === 'object' && data.hasOwnProperty('success')) {
        return originalSend.call(this, data);
      }

      // If it's an error response, format it
      if (res.statusCode >= 400) {
        const errorResponse = ResponseModel.error(
          data || 'An error occurred',
          'API_ERROR',
          res.statusCode
        );
        return originalSend.call(this, errorResponse);
      }

      // Format success response
      const successResponse = ResponseModel.success(data, 'Operation completed successfully', res.statusCode);
      return originalSend.call(this, successResponse);
    };

    next();
  };
};

/**
 * Error handling middleware
 * Catches and formats all errors
 * @returns {Function} Express middleware function
 */
const errorHandler = () => {
  return (err, req, res, next) => {
    console.error('Error caught by middleware:', err);

    // Prisma errors
    if (err.code === 'P2002') {
      return res.status(400).json(
        ResponseModel.error('A record with this information already exists', 'DUPLICATE_ENTRY', 400)
      );
    }

    if (err.code === 'P2025') {
      return res.status(404).json(
        ResponseModel.error('The requested record was not found', 'RECORD_NOT_FOUND', 404)
      );
    }

    if (err.code === 'P2003') {
      return res.status(400).json(
        ResponseModel.error('Foreign key constraint failed', 'FOREIGN_KEY_ERROR', 400)
      );
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json(
        ResponseModel.unauthorized('Invalid token')
      );
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(
        ResponseModel.unauthorized('Token expired')
      );
    }

    // Validation errors
    if (err.isJoi) {
      const errors = err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json(
        ResponseModel.validationError(errors)
      );
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    const code = err.code || 'INTERNAL_ERROR';

    return res.status(statusCode).json(
      ResponseModel.error(message, code, statusCode)
    );
  };
};

/**
 * Request logging middleware
 * Logs incoming requests with structured data
 * @returns {Function} Express middleware function
 */
const requestLogger = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Log request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined
    });

    // Override end method to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
      
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

/**
 * Rate limiting response formatter
 * Formats rate limit error responses
 * @returns {Function} Express middleware function
 */
const rateLimitFormatter = () => {
  return (req, res, next) => {
    // Override rate limit error response
    res.status(429).json(
      ResponseModel.error(
        'Too many requests from this IP, please try again later.',
        'RATE_LIMIT_EXCEEDED',
        429
      )
    );
  };
};

/**
 * Authentication middleware
 * Validates JWT tokens and attaches user data
 * @returns {Function} Express middleware function
 */
const authenticateToken = () => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json(
          ResponseModel.unauthorized('Access token required')
        );
      }

      // Verify token (you'll need to implement this based on your JWT setup)
      // const user = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = user;
      
      next();
    } catch (error) {
      return res.status(401).json(
        ResponseModel.unauthorized('Invalid or expired token')
      );
    }
  };
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(
          ResponseModel.unauthorized('Authentication required')
        );
      }

      const userRole = req.user.role;
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!roles.includes(userRole)) {
        return res.status(403).json(
          ResponseModel.forbidden('Insufficient permissions')
        );
      }

      next();
    } catch (error) {
      return res.status(500).json(
        ResponseModel.error('Authorization error occurred', 'AUTHORIZATION_ERROR', 500)
      );
    }
  };
};

module.exports = {
  validateRequest,
  validateId,
  formatResponse,
  errorHandler,
  requestLogger,
  rateLimitFormatter,
  authenticateToken,
  authorizeRoles
}; 