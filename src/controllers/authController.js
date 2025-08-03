const prisma = require('../models');
const { 
  generateToken, 
  hashPassword, 
  comparePassword 
} = require('../utils/auth');
const jwt = require('jsonwebtoken');

class AuthController {
  // User login
  static async login(credentials) {
    try {
      const { email, password } = credentials;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email, user.role);

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // User registration
  static async register(userData) {
    try {
      const { name, email, password, role } = userData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'USER'
        }
      });

      // Generate JWT token
      const token = generateToken(user.id, user.email, user.role);

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(token) {
    try {
      if (!token) {
        throw new Error('Access token is required');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid authentication token');
      }

      if (error.name === 'TokenExpiredError') {
        throw new Error('Authentication token has expired');
      }

      throw error;
    }
  }

  // Change password
  static async changePassword(token, passwordData) {
    try {
      if (!token) {
        throw new Error('Access token is required');
      }

      const { currentPassword, newPassword } = passwordData;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword }
      });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid authentication token');
      }

      throw error;
    }
  }

  // Refresh token
  static async refreshToken(token) {
    try {
      if (!token) {
        throw new Error('Access token is required');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = generateToken(user.id, user.email, user.role);

      return {
        success: true,
        data: {
          token: newToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid authentication token');
      }

      if (error.name === 'TokenExpiredError') {
        throw new Error('Authentication token has expired');
      }

      throw error;
    }
  }

  // Logout (client-side token removal)
  static async logout() {
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }
}

module.exports = AuthController; 