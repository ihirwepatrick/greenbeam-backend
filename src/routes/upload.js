const express = require('express');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const FileController = require('../controllers/fileController');

const router = express.Router();

// Upload single file
router.post('/single', authenticateToken, requireAdmin, uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file uploaded'
        }
      });
    }

    const { type = 'general', folder = 'general' } = req.body;
    const uploadedBy = req.user.id;

    const result = await FileController.uploadFile(req.file, type, folder, uploadedBy);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message
      }
    });
  }
});

// Upload multiple files
router.post('/multiple', authenticateToken, requireAdmin, uploadMiddleware.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No files uploaded'
        }
      });
    }

    const { type = 'general', folder = 'general' } = req.body;
    const uploadedBy = req.user.id;

    const result = await FileController.uploadMultipleFiles(req.files, type, folder, uploadedBy);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message
      }
    });
  }
});

// Upload files with specific fields
router.post('/fields', authenticateToken, requireAdmin, uploadMiddleware.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'heroImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'documents', maxCount: 5 }
]), async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No files uploaded'
        }
      });
    }

    const uploadedBy = req.user.id;
    const results = {};

    // Process each field
    for (const [fieldName, files] of Object.entries(req.files)) {
      if (files.length === 1) {
        // Single file
        const result = await FileController.uploadFile(
          files[0], 
          fieldName, 
          fieldName, 
          uploadedBy
        );
        results[fieldName] = result.data;
      } else {
        // Multiple files
        const result = await FileController.uploadMultipleFiles(
          files, 
          fieldName, 
          fieldName, 
          uploadedBy
        );
        results[fieldName] = result.data;
      }
    }

    res.status(201).json({
      success: true,
      data: results,
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading files with fields:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message
      }
    });
  }
});

// Get file by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await FileController.getFileById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching file:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get files with filters
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      type: req.query.type,
      folder: req.query.folder,
      search: req.query.search
    };

    const result = await FileController.getFiles(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Delete file
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await FileController.deleteFile(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting file:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Update file metadata
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, folder } = req.body;
    const updateData = {};
    
    if (type !== undefined) updateData.type = type;
    if (folder !== undefined) updateData.folder = folder;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No update data provided'
        }
      });
    }

    const result = await FileController.updateFile(req.params.id, updateData);
    res.json(result);
  } catch (error) {
    console.error('Error updating file:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// Get file statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await FileController.getFileStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching file stats:', error);
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