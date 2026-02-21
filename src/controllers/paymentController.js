const Payment = require('../models/Payment');
const Order = require('../models/Order');

class PaymentController {
  // Create payment intent
  static async createPayment(paymentData) {
    try {
      const payment = await Payment.create(paymentData);

      return {
        success: true,
        data: {
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          gateway: payment.gateway,
          status: payment.status,
          metadata: payment.metadata,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        },
        message: 'Payment created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get payment by ID
  static async getPaymentById(paymentId) {
    try {
      const payment = await Payment.getPaymentById(paymentId);

      return {
        success: true,
        data: {
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          gateway: payment.gateway,
          status: payment.status,
          transactionId: payment.transactionId,
          metadata: payment.metadata,
          order: {
            id: payment.order.id,
            orderNumber: payment.order.orderNumber,
            totalAmount: payment.order.totalAmount,
            status: payment.order.status,
            user: payment.order.user
          },
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get payments by order ID
  static async getPaymentsByOrderId(orderId) {
    try {
      const payments = await Payment.getPaymentsByOrderId(orderId);

      return {
        success: true,
        data: {
          payments: payments.map(payment => ({
            id: payment.id,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            gateway: payment.gateway,
            status: payment.status,
            transactionId: payment.transactionId,
            metadata: payment.metadata,
            order: {
              id: payment.order.id,
              orderNumber: payment.order.orderNumber,
              totalAmount: payment.order.totalAmount,
              status: payment.order.status,
              user: payment.order.user
            },
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt
          }))
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(paymentId, status, transactionId = null) {
    try {
      const payment = await Payment.updateStatus(paymentId, status, transactionId);

      return {
        success: true,
        data: {
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          gateway: payment.gateway,
          status: payment.status,
          transactionId: payment.transactionId,
          metadata: payment.metadata,
          order: {
            id: payment.order.id,
            orderNumber: payment.order.orderNumber,
            totalAmount: payment.order.totalAmount,
            status: payment.order.status,
            user: payment.order.user
          },
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        },
        message: 'Payment status updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get payment by transaction ID
  static async getPaymentByTransactionId(transactionId) {
    try {
      const payment = await Payment.getPaymentByTransactionId(transactionId);

      return {
        success: true,
        data: {
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          gateway: payment.gateway,
          status: payment.status,
          transactionId: payment.transactionId,
          metadata: payment.metadata,
          order: {
            id: payment.order.id,
            orderNumber: payment.order.orderNumber,
            totalAmount: payment.order.totalAmount,
            status: payment.order.status,
            user: payment.order.user
          },
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all payments (admin)
  static async getAllPayments(filters = {}) {
    try {
      const result = await Payment.getAllPayments(filters);

      return {
        success: true,
        data: {
          payments: result.payments.map(payment => ({
            id: payment.id,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            gateway: payment.gateway,
            status: payment.status,
            transactionId: payment.transactionId,
            metadata: payment.metadata,
            order: {
              id: payment.order.id,
              orderNumber: payment.order.orderNumber,
              totalAmount: payment.order.totalAmount,
              status: payment.order.status,
              user: payment.order.user
            },
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt
          })),
          pagination: result.pagination
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get payment statistics
  static async getPaymentStats() {
    try {
      const stats = await Payment.getPaymentStats();

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw error;
    }
  }

  // Process refund
  static async processRefund(paymentId, refundAmount, reason = '') {
    try {
      const refundPayment = await Payment.processRefund(paymentId, refundAmount, reason);

      return {
        success: true,
        data: {
          id: refundPayment.id,
          orderId: refundPayment.orderId,
          amount: refundPayment.amount,
          currency: refundPayment.currency,
          paymentMethod: refundPayment.paymentMethod,
          gateway: refundPayment.gateway,
          status: refundPayment.status,
          transactionId: refundPayment.transactionId,
          metadata: refundPayment.metadata,
          createdAt: refundPayment.createdAt,
          updatedAt: refundPayment.updatedAt
        },
        message: 'Refund processed successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Process payment with Stripe (placeholder for payment gateway integration)
  static async processStripePayment(paymentData) {
    try {
      // This is a placeholder for Stripe integration
      // In a real implementation, you would:
      // 1. Create a payment intent with Stripe
      // 2. Handle the payment confirmation
      // 3. Update the payment record

      const { orderId, amount, currency = 'RWF', paymentMethod } = paymentData;

      // Create payment record
      const payment = await Payment.create({
        orderId,
        amount,
        currency,
        paymentMethod,
        gateway: 'stripe',
        metadata: {
          stripe_payment_method: paymentMethod
        }
      });

      // Simulate payment processing
      // In real implementation, this would be handled by Stripe webhooks
      const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update payment status to completed
      const completedPayment = await Payment.updateStatus(payment.id, 'COMPLETED', transactionId);

      return {
        success: true,
        data: {
          id: completedPayment.id,
          orderId: completedPayment.orderId,
          amount: completedPayment.amount,
          currency: completedPayment.currency,
          paymentMethod: completedPayment.paymentMethod,
          gateway: completedPayment.gateway,
          status: completedPayment.status,
          transactionId: completedPayment.transactionId,
          metadata: completedPayment.metadata,
          createdAt: completedPayment.createdAt,
          updatedAt: completedPayment.updatedAt
        },
        message: 'Payment processed successfully'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PaymentController;
