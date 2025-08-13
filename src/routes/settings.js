const express = require('express');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const SettingsController = require('../controllers/settingsController');

const router = express.Router();

// Initialize default settings (admin only)
router.post('/initialize', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.initializeDefaultSettings();
    res.json(result);
  } catch (error) {
    console.error('Error initializing settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get all settings (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getAllSettings();
    res.json(result);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get settings by category (admin only)
router.get('/:category', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const result = await SettingsController.getSettingsByCategory(category);
    res.json(result);
  } catch (error) {
    console.error(`Error fetching ${req.params.category} settings:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update settings by category (admin only)
router.put('/:category', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const result = await SettingsController.updateSettingsByCategory(category, req.body);
    res.json(result);
  } catch (error) {
    console.error(`Error updating ${req.params.category} settings:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update single setting (admin only)
router.put('/:category/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category, key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Value is required'
        }
      });
    }

    const result = await SettingsController.updateSetting(category, key, value);
    res.json(result);
  } catch (error) {
    console.error(`Error updating setting ${req.params.category}.${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Delete single setting (admin only)
router.delete('/:category/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category, key } = req.params;
    const result = await SettingsController.deleteSetting(category, key);
    res.json(result);
  } catch (error) {
    console.error(`Error deleting setting ${req.params.category}.${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Website settings specific routes
router.get('/website/flattened', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getWebsiteSettings();
    res.json(result);
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update website settings (nested structure)
router.put('/website/nested', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.updateWebsiteSettings(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating website settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Specific website settings categories
router.get('/website/branding', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getSettingsByCategory('website');
    const branding = result.data.branding || {};
    res.json({
      success: true,
      data: branding
    });
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.put('/website/branding', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const brandingData = { branding: req.body };
    const result = await SettingsController.updateWebsiteSettings(brandingData);
    res.json(result);
  } catch (error) {
    console.error('Error updating branding settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.get('/website/content', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getSettingsByCategory('website');
    const content = result.data.content || {};
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.put('/website/content', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contentData = { content: req.body };
    const result = await SettingsController.updateWebsiteSettings(contentData);
    res.json(result);
  } catch (error) {
    console.error('Error updating content settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.get('/website/seo', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getSettingsByCategory('website');
    const seo = result.data.seo || {};
    res.json({
      success: true,
      data: seo
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.put('/website/seo', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const seoData = { seo: req.body };
    const result = await SettingsController.updateWebsiteSettings(seoData);
    res.json(result);
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.get('/website/social', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getSettingsByCategory('website');
    const social = result.data.social || {};
    res.json({
      success: true,
      data: social
    });
  } catch (error) {
    console.error('Error fetching social settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.put('/website/social', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const socialData = { social: req.body };
    const result = await SettingsController.updateWebsiteSettings(socialData);
    res.json(result);
  } catch (error) {
    console.error('Error updating social settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.get('/website/features', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getSettingsByCategory('website');
    const features = result.data.features || {};
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Error fetching features settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.put('/website/features', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const featuresData = { features: req.body };
    const result = await SettingsController.updateWebsiteSettings(featuresData);
    res.json(result);
  } catch (error) {
    console.error('Error updating features settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.get('/website/layout', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getSettingsByCategory('website');
    const layout = result.data.layout || {};
    res.json({
      success: true,
      data: layout
    });
  } catch (error) {
    console.error('Error fetching layout settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.put('/website/layout', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const layoutData = { layout: req.body };
    const result = await SettingsController.updateWebsiteSettings(layoutData);
    res.json(result);
  } catch (error) {
    console.error('Error updating layout settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.get('/website/performance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getSettingsByCategory('website');
    const performance = result.data.performance || {};
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching performance settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.put('/website/performance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const performanceData = { performance: req.body };
    const result = await SettingsController.updateWebsiteSettings(performanceData);
    res.json(result);
  } catch (error) {
    console.error('Error updating performance settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.get('/website/customization', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await SettingsController.getSettingsByCategory('website');
    const customization = result.data.customization || {};
    res.json({
      success: true,
      data: customization
    });
  } catch (error) {
    console.error('Error fetching customization settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.put('/website/customization', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const customizationData = { customization: req.body };
    const result = await SettingsController.updateWebsiteSettings(customizationData);
    res.json(result);
  } catch (error) {
    console.error('Error updating customization settings:', error);
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