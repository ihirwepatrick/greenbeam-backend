const express = require('express');
const SettingsController = require('../controllers/settingsController');

const router = express.Router();

/**
 * GET /api/v1/public/site-config
 * Unauthenticated: safe website + general fields for live storefront.
 */
router.get('/site-config', async (req, res) => {
  try {
    const result = await SettingsController.getPublicSiteConfig();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json(result);
  } catch (error) {
    console.error('[PUBLIC] site-config error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to load site configuration',
      },
    });
  }
});

module.exports = router;
