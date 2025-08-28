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
}

module.exports = Cart;
