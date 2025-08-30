const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Payment {
  // Create payment record
  static async create(paymentData) {
    try {
      const { orderId, amount, currency = 'USD', paymentMethod, gateway = 'stripe', metadata = {} } = paymentData;

      // Verify order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          orderId,
          amount,
          currency,
          paymentMethod,
          gateway,
          metadata,
          status: 'PENDING'
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  // Get payment by ID
  static async getPaymentById(paymentId) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      throw error;
    }
  }

  // Get payments by order ID
  static async getPaymentsByOrderId(orderId) {
    try {
      const payments = await prisma.payment.findMany({
        where: { orderId },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return payments;
    } catch (error) {
      throw error;
    }
  }

  // Update payment status
  static async updateStatus(paymentId, status, transactionId = null) {
    try {
      const updateData = { status };
      if (transactionId) {
        updateData.transactionId = transactionId;
      }

      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: updateData,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // Update order payment status if payment is completed
      if (status === 'COMPLETED') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'COMPLETED' }
        });
      } else if (status === 'FAILED') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'FAILED' }
        });
      }

      return payment;
    } catch (error) {
      throw error;
    }
  }

  // Get payment by transaction ID
  static async getPaymentByTransactionId(transactionId) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { transactionId },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      throw error;
    }
  }

  // Get all payments (admin)
  static async getAllPayments(filters = {}) {
    try {
      const { page = 1, limit = 10, status, paymentMethod, gateway } = filters;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (paymentMethod) where.paymentMethod = paymentMethod;
      if (gateway) where.gateway = gateway;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.payment.count({ where })
      ]);

      return {
        payments,
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

  // Get payment statistics
  static async getPaymentStats() {
    try {
      const [totalPayments, completedPayments, failedPayments, totalAmount] = await Promise.all([
        prisma.payment.count(),
        prisma.payment.count({ where: { status: 'COMPLETED' } }),
        prisma.payment.count({ where: { status: 'FAILED' } }),
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true }
        })
      ]);

      return {
        totalPayments,
        completedPayments,
        failedPayments,
        totalAmount: totalAmount._sum.amount || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Process refund
  static async processRefund(paymentId, refundAmount, reason = '') {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'COMPLETED') {
        throw new Error('Payment must be completed to process refund');
      }

      if (refundAmount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      // Create refund payment record
      const refundPayment = await prisma.payment.create({
        data: {
          orderId: payment.orderId,
          amount: -refundAmount, // Negative amount for refund
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          gateway: payment.gateway,
          status: 'COMPLETED',
          transactionId: `REFUND-${payment.transactionId}`,
          metadata: {
            originalPaymentId: paymentId,
            reason: reason,
            refundAmount: refundAmount
          }
        }
      });

      // Update original payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' }
      });

      // Update order status if full refund
      if (refundAmount === payment.amount) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { 
            status: 'REFUNDED',
            paymentStatus: 'REFUNDED'
          }
        });
      }

      return refundPayment;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Payment;
