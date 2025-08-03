const express = require('express');
const { 
  loginSchema, 
  registerSchema, 
  validate 
} = require('../utils/validation');
const AuthController = require('../controllers/authController');

const router = express.Router();

// User login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const result = await AuthController.login(req.validatedData);
    res.json(result);
  } catch (error) {
    console.error('Error during login:', error);
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed'
      }
    });
  }
});

// User registration
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const result = await AuthController.register(req.validatedData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.message === 'User with this email already exists') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Registration failed'
      }
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    const result = await AuthController.getUserProfile(token);
    res.json(result);
  } catch (error) {
    if (error.message === 'Access token is required') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: error.message
        }
      });
    }
    if (error.message === 'Invalid authentication token') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error.message
        }
      });
    }
    if (error.message === 'Authentication token has expired') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: error.message
        }
      });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: error.message
        }
      });
    }

    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user profile'
      }
    });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { currentPassword, newPassword } = req.body;
    
    const result = await AuthController.changePassword(token, { currentPassword, newPassword });
    res.json(result);
  } catch (error) {
    if (error.message === 'Access token is required') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: error.message
        }
      });
    }
    if (error.message === 'Invalid authentication token') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error.message
        }
      });
    }
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: error.message
        }
      });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: error.message
        }
      });
    }

    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to change password'
      }
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    const result = await AuthController.refreshToken(token);
    res.json(result);
  } catch (error) {
    if (error.message === 'Access token is required') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: error.message
        }
      });
    }
    if (error.message === 'Invalid authentication token') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error.message
        }
      });
    }
    if (error.message === 'Authentication token has expired') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: error.message
        }
      });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: error.message
        }
      });
    }

    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to refresh token'
      }
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', async (req, res) => {
  try {
    const result = await AuthController.logout();
    res.json(result);
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Logout failed'
      }
    });
  }
});

module.exports = router; 