const express = require('express');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const DashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Get dashboard statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await DashboardController.getDashboardStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get chart data for analytics (admin only)
router.get('/charts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const result = await DashboardController.getChartData(period);
    res.json(result);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get recent activity (admin only)
router.get('/activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const result = await DashboardController.getRecentActivity(limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router; 