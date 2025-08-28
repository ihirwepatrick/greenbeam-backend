const Order = require('../models/Order');
const Cart = require('../models/Cart');

class OrderController {
  // Create order from cart
  static async createOrderFromCart(userId, orderData) {
    try {
      // Get user's cart
      const cart = await Cart.getUserCart(userId);
      
      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Convert cart items to order items format
      const items = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      // Create order
      const order = await Order.create(userId, {
        ...orderData,
        items
      });

      // Clear cart after successful order creation
      await Cart.clearCart(userId);

      return {
        success: true,
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price
            }
          })),
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        },
        message: 'Order created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Create order with custom items
  static async createOrder(userId, orderData) {
    try {
      const order = await Order.create(userId, orderData);

      return {
        success: true,
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price
            }
          })),
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        },
        message: 'Order created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(orderId) {
    try {
      const order = await Order.getOrderById(orderId);

      return {
        success: true,
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price
            }
          })),
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          user: order.user,
          payments: order.payments,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber) {
    try {
      const order = await Order.getOrderByNumber(orderNumber);

      return {
        success: true,
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price
            }
          })),
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          user: order.user,
          payments: order.payments,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user's orders
  static async getUserOrders(userId, filters = {}) {
    try {
      const result = await Order.getUserOrders(userId, filters);

      return {
        success: true,
        data: {
          orders: result.orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            paymentStatus: order.paymentStatus,
            itemCount: order.items.length,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          })),
          pagination: result.pagination
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all orders (admin)
  static async getAllOrders(filters = {}) {
    try {
      const result = await Order.getAllOrders(filters);

      return {
        success: true,
        data: {
          orders: result.orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            paymentStatus: order.paymentStatus,
            itemCount: order.items.length,
            paymentMethod: order.paymentMethod,
            user: order.user,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          })),
          pagination: result.pagination
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.updateStatus(orderId, status);

      return {
        success: true,
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price
            }
          })),
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          user: order.user,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        },
        message: 'Order status updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(orderId) {
    try {
      const order = await Order.cancelOrder(orderId);

      return {
        success: true,
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price
            }
          })),
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          user: order.user,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        },
        message: 'Order cancelled successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get order statistics
  static async getOrderStats(userId = null) {
    try {
      const stats = await Order.getOrderStats(userId);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderController;
