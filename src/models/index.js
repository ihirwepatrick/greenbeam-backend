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

// Export the Prisma client for raw queries
module.exports.$queryRaw = prisma.$queryRaw;
module.exports.$executeRaw = prisma.$executeRaw;

// Export Prisma utilities
module.exports.Prisma = require('@prisma/client').Prisma; 