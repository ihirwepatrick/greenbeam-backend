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
}

module.exports = CartController;
