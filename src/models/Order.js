const prisma = require('./index');

class Order {
  // Generate unique order number
  static generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  // Create new order
  static async create(userId, orderData) {
    try {
      const { items, shippingAddress, billingAddress, paymentMethod, notes } = orderData;
      
      // Generate order number
      const orderNumber = this.generateOrderNumber();
      
      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      // Validate and calculate items
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: parseInt(item.productId) }
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.status !== 'AVAILABLE') {
          throw new Error(`Product ${product.name} is not available`);
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: parseInt(item.productId),
          quantity: item.quantity,
          price: product.price
        });
      }

      // Create order with items in a transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            userId,
            orderNumber,
            totalAmount,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            notes,
            status: 'PENDING',
            paymentStatus: 'PENDING'
          }
        });

        // Create order items
        for (const item of orderItems) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }
          });
        }

        return newOrder;
      });

      // Return order with items
      return await this.getOrderById(order.id);
    } catch (error) {
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(orderId) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          payments: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: true
            }
          },
          payments: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Get user's orders
  static async getUserOrders(userId, filters = {}) {
    try {
      const { page = 1, limit = 10, status, paymentStatus } = filters;
      const skip = (page - 1) * limit;

      const where = { userId };
      if (status) where.status = status;
      if (paymentStatus) where.paymentStatus = paymentStatus;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    price: true
                  }
                }
              }
            },
            payments: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all orders (admin)
  static async getAllOrders(filters = {}) {
    try {
      const { page = 1, limit = 10, status, paymentStatus, search } = filters;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    price: true
                  }
                }
              }
            },
            payments: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update order status
  static async updateStatus(orderId, status) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(orderId) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'CANCELLED',
          paymentStatus: 'CANCELLED'
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Get order statistics
  static async getOrderStats(userId = null) {
    try {
      const where = userId ? { userId } : {};

      const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.count({ where: { ...where, status: 'PENDING' } }),
        prisma.order.count({ where: { ...where, status: 'DELIVERED' } }),
        prisma.order.aggregate({
          where: { ...where, status: 'DELIVERED' },
          _sum: { totalAmount: true }
        })
      ]);

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;
