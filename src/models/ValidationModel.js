/**
 * Enhanced Validation Model
 * Comprehensive validation schemas and error handling for API endpoints
 */

const Joi = require('joi');
const ResponseModel = require('./ResponseModel');

class ValidationModel {
  // Enquiry validation schemas
  static enquirySchemas = {
    create: Joi.object({
      customerName: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
          'string.min': 'Customer name must be at least 2 characters long',
          'string.max': 'Customer name cannot exceed 255 characters',
          'any.required': 'Customer name is required'
        }),
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      phone: Joi.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      product: Joi.string()
        .min(1)
        .max(255)
        .required()
        .messages({
          'string.min': 'Product name must be at least 1 character long',
          'string.max': 'Product name cannot exceed 255 characters',
          'any.required': 'Product name is required'
        }),
      subject: Joi.string()
        .min(5)
        .max(500)
        .required()
        .messages({
          'string.min': 'Subject must be at least 5 characters long',
          'string.max': 'Subject cannot exceed 500 characters',
          'any.required': 'Subject is required'
        }),
      message: Joi.string()
        .min(10)
        .max(2000)
        .required()
        .messages({
          'string.min': 'Message must be at least 10 characters long',
          'string.max': 'Message cannot exceed 2000 characters',
          'any.required': 'Message is required'
        }),
      source: Joi.string()
        .max(100)
        .default('Website Form')
        .messages({
          'string.max': 'Source cannot exceed 100 characters'
        }),
      location: Joi.string()
        .max(255)
        .optional()
        .messages({
          'string.max': 'Location cannot exceed 255 characters'
        }),
      priority: Joi.string()
        .valid('HIGH', 'MEDIUM', 'LOW')
        .default('MEDIUM')
        .messages({
          'any.only': 'Priority must be HIGH, MEDIUM, or LOW'
        })
    }),

    updateStatus: Joi.object({
      status: Joi.string()
        .valid('NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED')
        .required()
        .messages({
          'any.only': 'Status must be NEW, IN_PROGRESS, RESPONDED, or CLOSED',
          'any.required': 'Status is required'
        })
    }),

    respond: Joi.object({
      message: Joi.string()
        .min(10)
        .max(2000)
        .required()
        .messages({
          'string.min': 'Response message must be at least 10 characters long',
          'string.max': 'Response message cannot exceed 2000 characters',
          'any.required': 'Response message is required'
        }),
      sendEmail: Joi.boolean()
        .default(true)
        .messages({
          'boolean.base': 'sendEmail must be a boolean value'
        })
    })
  };

  // Product validation schemas
  static productSchemas = {
    create: Joi.object({
      name: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
          'string.min': 'Product name must be at least 2 characters long',
          'string.max': 'Product name cannot exceed 255 characters',
          'any.required': 'Product name is required'
        }),
      category: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': 'Category must be at least 2 characters long',
          'string.max': 'Category cannot exceed 100 characters',
          'any.required': 'Category is required'
        }),
      description: Joi.string()
        .max(2000)
        .optional()
        .messages({
          'string.max': 'Description cannot exceed 2000 characters'
        }),
      image: Joi.string()
        .uri()
        .optional()
        .messages({
          'string.uri': 'Please provide a valid image URL'
        }),
      features: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
          'array.base': 'Features must be an array'
        }),
      specifications: Joi.object()
        .optional()
        .messages({
          'object.base': 'Specifications must be an object'
        }),
      status: Joi.string()
        .valid('AVAILABLE', 'NOT_AVAILABLE')
        .default('AVAILABLE')
        .messages({
          'any.only': 'Status must be AVAILABLE or NOT_AVAILABLE'
        }),
      images: Joi.array()
        .items(Joi.string().uri())
        .optional()
        .messages({
          'array.base': 'Images must be an array',
          'string.uri': 'Each image must be a valid URL'
        })
    }),

    update: Joi.object({
      name: Joi.string()
        .min(2)
        .max(255)
        .optional()
        .messages({
          'string.min': 'Product name must be at least 2 characters long',
          'string.max': 'Product name cannot exceed 255 characters'
        }),
      category: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
          'string.min': 'Category must be at least 2 characters long',
          'string.max': 'Category cannot exceed 100 characters'
        }),
      description: Joi.string()
        .max(2000)
        .optional()
        .messages({
          'string.max': 'Description cannot exceed 2000 characters'
        }),
      image: Joi.string()
        .uri()
        .optional()
        .messages({
          'string.uri': 'Please provide a valid image URL'
        }),
      features: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
          'array.base': 'Features must be an array'
        }),
      specifications: Joi.object()
        .optional()
        .messages({
          'object.base': 'Specifications must be an object'
        }),
      status: Joi.string()
        .valid('AVAILABLE', 'NOT_AVAILABLE')
        .optional()
        .messages({
          'any.only': 'Status must be AVAILABLE or NOT_AVAILABLE'
        }),
      images: Joi.array()
        .items(Joi.string().uri())
        .optional()
        .messages({
          'array.base': 'Images must be an array',
          'string.uri': 'Each image must be a valid URL'
        })
    })
  };

  // User validation schemas
  static userSchemas = {
    register: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required'
        }),
      name: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
          'string.min': 'Name must be at least 2 characters long',
          'string.max': 'Name cannot exceed 255 characters',
          'any.required': 'Name is required'
        }),
      role: Joi.string()
        .valid('ADMIN', 'USER')
        .default('ADMIN')
        .messages({
          'any.only': 'Role must be ADMIN or USER'
        })
    }),

    login: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .required()
        .messages({
          'any.required': 'Password is required'
        })
    })
  };

  // Notification validation schemas
  static notificationSchemas = {
    create: Joi.object({
      type: Joi.string()
        .valid('ENQUIRY', 'SYSTEM', 'ALERT')
        .required()
        .messages({
          'any.only': 'Type must be ENQUIRY, SYSTEM, or ALERT',
          'any.required': 'Type is required'
        }),
      title: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
          'string.min': 'Title must be at least 2 characters long',
          'string.max': 'Title cannot exceed 255 characters',
          'any.required': 'Title is required'
        }),
      message: Joi.string()
        .min(5)
        .max(1000)
        .required()
        .messages({
          'string.min': 'Message must be at least 5 characters long',
          'string.max': 'Message cannot exceed 1000 characters',
          'any.required': 'Message is required'
        }),
      priority: Joi.string()
        .valid('HIGH', 'MEDIUM', 'LOW')
        .default('MEDIUM')
        .messages({
          'any.only': 'Priority must be HIGH, MEDIUM, or LOW'
        }),
      data: Joi.object()
        .optional()
        .messages({
          'object.base': 'Data must be an object'
        })
    })
  };

  // Email validation schemas
  static emailSchemas = {
    send: Joi.object({
      toEmail: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Recipient email is required'
        }),
      subject: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
          'string.min': 'Subject must be at least 2 characters long',
          'string.max': 'Subject cannot exceed 255 characters',
          'any.required': 'Subject is required'
        }),
      body: Joi.string()
        .min(10)
        .required()
        .messages({
          'string.min': 'Email body must be at least 10 characters long',
          'any.required': 'Email body is required'
        }),
      type: Joi.string()
        .valid('ENQUIRY_RESPONSE', 'SYSTEM', 'MARKETING')
        .default('SYSTEM')
        .messages({
          'any.only': 'Type must be ENQUIRY_RESPONSE, SYSTEM, or MARKETING'
        })
    })
  };

  // Query parameter validation schemas
  static querySchemas = {
    pagination: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
          'number.base': 'Page must be a number',
          'number.integer': 'Page must be an integer',
          'number.min': 'Page must be at least 1'
        }),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
          'number.base': 'Limit must be a number',
          'number.integer': 'Limit must be an integer',
          'number.min': 'Limit must be at least 1',
          'number.max': 'Limit cannot exceed 100'
        }),
      search: Joi.string()
        .max(255)
        .optional()
        .messages({
          'string.max': 'Search term cannot exceed 255 characters'
        }),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'name', 'email', 'status', 'priority')
        .default('createdAt')
        .messages({
          'any.only': 'Invalid sort field'
        }),
      sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .messages({
          'any.only': 'Sort order must be asc or desc'
        })
    })
  };

  /**
   * Validate data against a schema
   * @param {Object} data - Data to validate
   * @param {Joi.Schema} schema - Validation schema
   * @returns {Object} Validation result
   */
  static validate(data, schema) {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return {
        isValid: false,
        errors,
        formattedResponse: ResponseModel.validationError(errors)
      };
    }

    return {
      isValid: true,
      data: value,
      errors: null
    };
  }

  /**
   * Validate enquiry data
   * @param {Object} data - Enquiry data
   * @param {string} type - Validation type (create, updateStatus, respond)
   * @returns {Object} Validation result
   */
  static validateEnquiry(data, type = 'create') {
    const schema = this.enquirySchemas[type];
    if (!schema) {
      throw new Error(`Invalid validation type: ${type}`);
    }
    return this.validate(data, schema);
  }

  /**
   * Validate product data
   * @param {Object} data - Product data
   * @param {string} type - Validation type (create, update)
   * @returns {Object} Validation result
   */
  static validateProduct(data, type = 'create') {
    const schema = this.productSchemas[type];
    if (!schema) {
      throw new Error(`Invalid validation type: ${type}`);
    }
    return this.validate(data, schema);
  }

  /**
   * Validate user data
   * @param {Object} data - User data
   * @param {string} type - Validation type (register, login)
   * @returns {Object} Validation result
   */
  static validateUser(data, type = 'register') {
    const schema = this.userSchemas[type];
    if (!schema) {
      throw new Error(`Invalid validation type: ${type}`);
    }
    return this.validate(data, schema);
  }

  /**
   * Validate notification data
   * @param {Object} data - Notification data
   * @returns {Object} Validation result
   */
  static validateNotification(data) {
    return this.validate(data, this.notificationSchemas.create);
  }

  /**
   * Validate email data
   * @param {Object} data - Email data
   * @returns {Object} Validation result
   */
  static validateEmail(data) {
    return this.validate(data, this.emailSchemas.send);
  }

  /**
   * Validate query parameters
   * @param {Object} data - Query parameters
   * @returns {Object} Validation result
   */
  static validateQuery(data) {
    return this.validate(data, this.querySchemas.pagination);
  }

  /**
   * Sanitize and validate ID parameter
   * @param {string} id - ID to validate
   * @param {string} type - ID type (string, number)
   * @returns {Object} Validation result
   */
  static validateId(id, type = 'string') {
    if (type === 'number') {
      const numId = parseInt(id);
      if (isNaN(numId) || numId <= 0) {
        return {
          isValid: false,
          errors: [{ field: 'id', message: 'Invalid ID format' }],
          formattedResponse: ResponseModel.error('Invalid ID format', 'INVALID_ID', 400)
        };
      }
      return { isValid: true, data: numId, errors: null };
    }

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return {
        isValid: false,
        errors: [{ field: 'id', message: 'ID is required' }],
        formattedResponse: ResponseModel.error('ID is required', 'MISSING_ID', 400)
      };
    }

    return { isValid: true, data: id.trim(), errors: null };
  }
}

module.exports = ValidationModel; 