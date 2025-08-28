const prisma = require('./index');

class Cart {
  // Add item to cart
  static async addItem(userId, productId, quantity = 1) {
    try {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cart.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: parseInt(productId)
          }
        }
      });

      if (existingItem) {
        // Update quantity
        return await prisma.cart.update({
          where: {
            userId_productId: {
              userId,
              productId: parseInt(productId)
            }
          },
          data: {
            quantity: existingItem.quantity + quantity
          },
          include: {
            product: true
          }
        });
      } else {
        // Create new cart item
        return await prisma.cart.create({
          data: {
            userId,
            productId: parseInt(productId),
            quantity
          },
          include: {
            product: true
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Get user's cart
  static async getUserCart(userId) {
    try {
      const cartItems = await prisma.cart.findMany({
        where: { userId },
        include: {
          product: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calculate total
      const total = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0);

      return {
        items: cartItems,
        total: total,
        itemCount: cartItems.length
      };
    } catch (error) {
      throw error;
    }
  }

  // Update cart item quantity
  static async updateQuantity(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return await this.removeItem(userId, productId);
      }

      const updatedItem = await prisma.cart.update({
        where: {
          userId_productId: {
            userId,
            productId: parseInt(productId)
          }
        },
        data: { quantity },
        include: {
          product: true
        }
      });

      return updatedItem;
    } catch (error) {
      throw error;
    }
  }

  // Remove item from cart
  static async removeItem(userId, productId) {
    try {
      await prisma.cart.delete({
        where: {
          userId_productId: {
            userId,
            productId: parseInt(productId)
          }
        }
      });

      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      throw error;
    }
  }

  // Clear user's cart
  static async clearCart(userId) {
    try {
      await prisma.cart.deleteMany({
        where: { userId }
      });

      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get cart item count
  static async getItemCount(userId) {
    try {
      const count = await prisma.cart.count({
        where: { userId }
      });

      return count;
    } catch (error) {
      throw error;
    }
  }

  // Check if product is in cart
  static async isInCart(userId, productId) {
    try {
      const item = await prisma.cart.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: parseInt(productId)
          }
        }
      });

      return !!item;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all carts with pagination and search
  static async getAllCarts(limit = 10, offset = 0, search = '') {
    try {
      const whereClause = search ? {
        OR: [
          {
            user: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            product: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        ]
      } : {};

      const [carts, total] = await Promise.all([
        prisma.cart.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                category: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: offset
        }),
        prisma.cart.count({
          where: whereClause
        })
      ]);

      return {
        carts,
        total
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get cart statistics
  static async getCartStats() {
    try {
      const [
        totalCarts,
        totalItems,
        totalValue,
        activeCarts
      ] = await Promise.all([
        // Total number of cart items
        prisma.cart.count(),
        // Total quantity of all items
        prisma.cart.aggregate({
          _sum: {
            quantity: true
          }
        }),
        // Total value of all cart items
        prisma.cart.findMany({
          include: {
            product: {
              select: {
                price: true
              }
            }
          }
        }),
        // Number of users with active carts
        prisma.cart.groupBy({
          by: ['userId'],
          _count: {
            userId: true
          }
        })
      ]);

      // Calculate total value
      const calculatedTotalValue = totalValue.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0);

      // Calculate averages
      const averageItemsPerCart = totalCarts > 0 ? totalItems._sum.quantity / totalCarts : 0;
      const averageCartValue = activeCarts.length > 0 ? calculatedTotalValue / activeCarts.length : 0;

      return {
        totalCarts,
        totalItems: totalItems._sum.quantity || 0,
        totalValue: calculatedTotalValue,
        averageItemsPerCart,
        averageCartValue,
        activeCarts: activeCarts.length
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cart;
