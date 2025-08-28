const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Export the Prisma client instance
module.exports = prisma;

// Export individual models for convenience
module.exports.Enquiry = prisma.enquiry;
module.exports.EnquiryResponse = prisma.enquiryResponse;
module.exports.Product = prisma.product;
module.exports.Notification = prisma.notification;
module.exports.EmailLog = prisma.emailLog;
module.exports.User = prisma.user;
module.exports.Settings = prisma.settings;
module.exports.Cart = prisma.cart;
module.exports.Order = prisma.order;
module.exports.OrderItem = prisma.orderItem;
module.exports.Payment = prisma.payment;
// Export the Prisma client for raw queries
module.exports.$queryRaw = prisma.$queryRaw;
module.exports.$executeRaw = prisma.$executeRaw;

// Export Prisma utilities
module.exports.Prisma = require('@prisma/client').Prisma;

// Export new model classes
module.exports.ResponseModel = require('./ResponseModel');
module.exports.DTOModel = require('./DTOModel');
module.exports.ServiceModel = require('./ServiceModel');
module.exports.ValidationModel = require('./ValidationModel');
module.exports.CartModel = require('./Cart');
module.exports.OrderModel = require('./Order');
module.exports.PaymentModel = require('./Payment');

// Export individual DTOs for convenience
const { 
  EnquiryDTO, 
  EnquiryResponseDTO, 
  ProductDTO, 
  UserDTO, 
  NotificationDTO, 
  EmailLogDTO 
} = require('./DTOModel');

module.exports.EnquiryDTO = EnquiryDTO;
module.exports.EnquiryResponseDTO = EnquiryResponseDTO;
module.exports.ProductDTO = ProductDTO;
module.exports.UserDTO = UserDTO;
module.exports.NotificationDTO = NotificationDTO;
module.exports.EmailLogDTO = EmailLogDTO;

// Export individual services for convenience
const { 
  EnquiryService, 
  ProductService, 
  NotificationService, 
  DashboardService 
} = require('./ServiceModel');

module.exports.EnquiryService = EnquiryService;
module.exports.ProductService = ProductService;
module.exports.NotificationService = NotificationService;
module.exports.DashboardService = DashboardService;

