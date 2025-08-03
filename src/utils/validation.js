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
  priority: Joi.string().valid('High', 'Medium', 'Low').default('Medium')
});

const updateEnquiryStatusSchema = Joi.object({
  status: Joi.string().valid('New', 'In Progress', 'Responded', 'Closed').required()
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
  image: Joi.string().uri().optional(),
  features: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.object().optional(),
  status: Joi.string().valid('Available', 'Not Available').default('Available'),
  images: Joi.array().items(Joi.string().uri()).optional()
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  category: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(2000).optional(),
  image: Joi.string().uri().optional(),
  features: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.object().optional(),
  status: Joi.string().valid('Available', 'Not Available').optional(),
  images: Joi.array().items(Joi.string().uri()).optional()
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
  status: Joi.string().valid('New', 'In Progress', 'Responded', 'Closed').optional(),
  priority: Joi.string().valid('High', 'Medium', 'Low').optional()
});

const productQuerySchema = paginationSchema.keys({
  category: Joi.string().max(100).optional(),
  status: Joi.string().valid('Available', 'Not Available').optional()
});

const notificationQuerySchema = paginationSchema.keys({
  read: Joi.boolean().optional(),
  type: Joi.string().valid('enquiry', 'system', 'alert').optional()
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
          details: error.details
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
          details: error.details
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
  validate,
  validateQuery
}; 