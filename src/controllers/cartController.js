const Cart = require('../models/Cart');

class CartController {
  // Add item to cart
  static async addToCart(userId, productId, quantity = 1) {
    try {
      const cartItem = await Cart.addItem(userId, productId, quantity);

      return {
        success: true,
        data: {
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          product: {
            id: cartItem.product.id,
            name: cartItem.product.name,
            price: cartItem.product.price,
            image: cartItem.product.image,
            category: cartItem.product.category
          },
          createdAt: cartItem.createdAt,
          updatedAt: cartItem.updatedAt
        },
        message: 'Item added to cart successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user's cart
  static async getUserCart(userId) {
    try {
      const cart = await Cart.getUserCart(userId);

      return {
        success: true,
        data: {
          items: cart.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              category: item.product.category,
              description: item.product.description
            },
            itemTotal: parseFloat(item.product.price) * item.quantity,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          })),
          total: cart.total,
          itemCount: cart.itemCount
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update cart item quantity
  static async updateCartItem(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const result = await Cart.removeItem(userId, productId);
        return {
          success: true,
          data: result,
          message: 'Item removed from cart'
        };
      }

      const cartItem = await Cart.updateQuantity(userId, productId, quantity);

      return {
        success: true,
        data: {
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          product: {
            id: cartItem.product.id,
            name: cartItem.product.name,
            price: cartItem.product.price,
            image: cartItem.product.image,
            category: cartItem.product.category
          },
          itemTotal: parseFloat(cartItem.product.price) * cartItem.quantity,
          createdAt: cartItem.createdAt,
          updatedAt: cartItem.updatedAt
        },
        message: 'Cart item updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Remove item from cart
  static async removeFromCart(userId, productId) {
    try {
      const result = await Cart.removeItem(userId, productId);

      return {
        success: true,
        data: result,
        message: 'Item removed from cart successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Clear user's cart
  static async clearCart(userId) {
    try {
      const result = await Cart.clearCart(userId);

      return {
        success: true,
        data: result,
        message: 'Cart cleared successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get cart item count
  static async getCartItemCount(userId) {
    try {
      const count = await Cart.getItemCount(userId);

      return {
        success: true,
        data: { count }
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if product is in cart
  static async isProductInCart(userId, productId) {
    try {
      const isInCart = await Cart.isInCart(userId, productId);

      return {
        success: true,
        data: { isInCart }
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all carts
  static async getAllCarts(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      const carts = await Cart.getAllCarts(limit, offset, search);

      return {
        success: true,
        data: {
          carts: carts.carts.map(cart => ({
            id: cart.id,
            userId: cart.userId,
            productId: cart.productId,
            quantity: cart.quantity,
            user: {
              id: cart.user.id,
              name: cart.user.name,
              email: cart.user.email
            },
            product: {
              id: cart.product.id,
              name: cart.product.name,
              price: cart.product.price,
              image: cart.product.image,
              category: cart.product.category
            },
            itemTotal: parseFloat(cart.product.price) * cart.quantity,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt
          })),
          pagination: {
            page,
            limit,
            total: carts.total,
            totalPages: Math.ceil(carts.total / limit)
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get cart by user ID
  static async getCartByUserId(userId) {
    try {
      const cart = await Cart.getUserCart(userId);

      return {
        success: true,
        data: {
          userId,
          user: cart.user,
          items: cart.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              category: item.product.category,
              description: item.product.description
            },
            itemTotal: parseFloat(item.product.price) * item.quantity,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          })),
          total: cart.total,
          itemCount: cart.itemCount
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Update cart item for any user
  static async adminUpdateCartItem(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
        const result = await Cart.removeItem(userId, productId);
        return {
          success: true,
          data: result,
          message: 'Item removed from cart'
        };
      }

      const cartItem = await Cart.updateQuantity(userId, productId, quantity);

      return {
        success: true,
        data: {
          id: cartItem.id,
          userId: cartItem.userId,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          product: {
            id: cartItem.product.id,
            name: cartItem.product.name,
            price: cartItem.product.price,
            image: cartItem.product.image,
            category: cartItem.product.category
          },
          itemTotal: parseFloat(cartItem.product.price) * cartItem.quantity,
          createdAt: cartItem.createdAt,
          updatedAt: cartItem.updatedAt
        },
        message: 'Cart item updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Remove item from any user's cart
  static async adminRemoveFromCart(userId, productId) {
    try {
      const result = await Cart.removeItem(userId, productId);

      return {
        success: true,
        data: result,
        message: 'Item removed from cart successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Clear any user's cart
  static async adminClearCart(userId) {
    try {
      const result = await Cart.clearCart(userId);

      return {
        success: true,
        data: result,
        message: 'Cart cleared successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get cart statistics
  static async getCartStats() {
    try {
      const stats = await Cart.getCartStats();

      return {
        success: true,
        data: {
          totalCarts: stats.totalCarts,
          totalItems: stats.totalItems,
          totalValue: stats.totalValue,
          averageItemsPerCart: stats.averageItemsPerCart,
          averageCartValue: stats.averageCartValue,
          activeCarts: stats.activeCarts
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CartController;
