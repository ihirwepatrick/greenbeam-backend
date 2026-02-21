const Joi = require('joi');

// Enquiry validation schemas
const createEnquirySchema = Joi.object({
  customerName: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  product: Joi.string().min(1).max(255).required(),
  subject: Joi.string().min(5).max(500).required(),
  message: Joi.string().min(10).max(2000).required(),
  source: Joi.string().max(100).default('Website Form'),
  location: Joi.string().max(255).optional(),
  priority: Joi.string().valid('HIGH', 'MEDIUM', 'LOW').default('MEDIUM')
});

const updateEnquiryStatusSchema = Joi.object({
  status: Joi.string().valid('NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED').required()
});

const respondToEnquirySchema = Joi.object({
  message: Joi.string().min(10).max(2000).required(),
  sendEmail: Joi.boolean().default(true)
});

// Product validation schemas
const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  category: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(2000).optional(),
  price: Joi.number().positive().precision(2).required(),
  features: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return helpers.error('any.invalid');
      } catch (error) {
        return helpers.error('any.invalid');
      }
    }, 'json-array')
  ).optional(),
  specifications: Joi.alternatives().try(
    Joi.object(),
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
        return helpers.error('any.invalid');
      } catch (error) {
        return helpers.error('any.invalid');
      }
    }, 'json-object')
  ).optional(),
  status: Joi.string().valid('AVAILABLE', 'NOT_AVAILABLE').default('AVAILABLE')
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  category: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(2000).optional(),
  price: Joi.number().positive().precision(2).optional(),
  features: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return helpers.error('any.invalid');
      } catch (error) {
        return helpers.error('any.invalid');
      }
    }, 'json-array')
  ).optional(),
  specifications: Joi.alternatives().try(
    Joi.object(),
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
        return helpers.error('any.invalid');
      } catch (error) {
        return helpers.error('any.invalid');
      }
    }, 'json-object')
  ).optional(),
  status: Joi.string().valid('AVAILABLE', 'NOT_AVAILABLE').optional()
});

// Email validation schema
const sendEmailSchema = Joi.object({
  to: Joi.string().email().required(),
  subject: Joi.string().min(5).max(500).required(),
  body: Joi.string().min(10).max(5000).required(),
  type: Joi.string().max(100).required(),
  template: Joi.string().max(100).optional(),
  data: Joi.object().optional()
});

// Authentication schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'USER').default('USER')
});

// Query parameter schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(255).optional(),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const enquiryQuerySchema = paginationSchema.keys({
  status: Joi.string().valid('NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED').optional(),
  priority: Joi.string().valid('HIGH', 'MEDIUM', 'LOW').optional()
});

const productQuerySchema = paginationSchema.keys({
  category: Joi.string().max(100).optional(),
  status: Joi.string().valid('AVAILABLE', 'NOT_AVAILABLE').optional()
});

const notificationQuerySchema = paginationSchema.keys({
  read: Joi.boolean().optional(),
  type: Joi.string().valid('ENQUIRY', 'SYSTEM', 'ALERT').optional()
});

// Cart validation schemas
const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(100).default(1)
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required()
});

// Order validation schemas
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
    address: Joi.string().min(10).max(500).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    zipCode: Joi.string().min(3).max(20).required(),
    country: Joi.string().min(2).max(100).required()
  }).required(),
  billingAddress: Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
    address: Joi.string().min(10).max(500).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    zipCode: Joi.string().min(3).max(20).required(),
    country: Joi.string().min(2).max(100).required()
  }).optional(),
  paymentMethod: Joi.string().valid('stripe', 'paypal', 'bank_transfer').required(),
  notes: Joi.string().max(1000).optional()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED').required()
});

// Payment validation schemas
const createPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().positive().precision(2).required(),
  currency: Joi.string().length(3).default('RWF'),
  paymentMethod: Joi.string().valid('stripe', 'paypal', 'bank_transfer').required(),
  metadata: Joi.object().optional()
});

const orderQuerySchema = paginationSchema.keys({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED').optional(),
  paymentStatus: Joi.string().valid('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED').optional()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
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
        }
      });
    }
    req.validatedData = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
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
        }
      });
    }
    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  createEnquirySchema,
  updateEnquiryStatusSchema,
  respondToEnquirySchema,
  createProductSchema,
  updateProductSchema,
  sendEmailSchema,
  loginSchema,
  registerSchema,
  enquiryQuerySchema,
  productQuerySchema,
  notificationQuerySchema,
  addToCartSchema,
  updateCartItemSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createPaymentSchema,
  orderQuerySchema,
  validate,
  validateQuery
}; 