const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Product {
  // Create new product
  static async create(data) {
    return await prisma.product.create({
      data
    });
  }

  // Find product by ID
  static async findById(id) {
    return await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
  }

  // Find all products with filters and pagination
  static async findAll(filters = {}) {
    const { page = 1, limit = 10, search, category, status, sortBy, sortOrder } = filters;
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

    return { products, total };
  }

  // Update product
  static async update(id, data) {
    return await prisma.product.update({
      where: { id: parseInt(id) },
      data
    });
  }

  // Update product rating
  static async updateRating(id, rating, reviews) {
    return await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        rating,
        reviews
      }
    });
  }

  // Delete product
  static async delete(id) {
    return await prisma.product.delete({
      where: { id: parseInt(id) }
    });
  }

  // Count products
  static async count(where = {}) {
    return await prisma.product.count({ where });
  }

  // Count products by status
  static async countByStatus(status) {
    return await prisma.product.count({
      where: { status }
    });
  }

  // Count products by category
  static async countByCategory(category) {
    return await prisma.product.count({
      where: { category }
    });
  }

  // Get product categories
  static async getCategories() {
    return await prisma.product.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });
  }

  // Get recent products
  static async getRecent(limit = 10) {
    return await prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get products by category
  static async getByCategory(category, limit = 10) {
    return await prisma.product.findMany({
      where: { category },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get products by status
  static async getByStatus(status, limit = 10) {
    return await prisma.product.findMany({
      where: { status },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get products by date range
  static async getByDateRange(startDate, endDate) {
    return await prisma.product.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Group products by category
  static async groupByCategory() {
    return await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
  }

  // Group products by status
  static async groupByStatus() {
    return await prisma.product.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
  }

  // Search products
  static async search(searchTerm, limit = 10) {
    return await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get top rated products
  static async getTopRated(limit = 10) {
    return await prisma.product.findMany({
      where: {
        rating: {
          gt: 0
        }
      },
      take: limit,
      orderBy: { rating: 'desc' }
    });
  }

  // Get products with most reviews
  static async getMostReviewed(limit = 10) {
    return await prisma.product.findMany({
      where: {
        reviews: {
          gt: 0
        }
      },
      take: limit,
      orderBy: { reviews: 'desc' }
    });
  }
}

module.exports = Product; 