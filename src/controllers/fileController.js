const prisma = require('../models');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class FileController {
  // Upload file to Supabase storage
  static async uploadFile(file, type = 'general', folder = 'general', uploadedBy = null) {
    try {
      const supabase = global.supabase || require('../config/supabase');
      
      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${uuidv4()}${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log('[FILE] Uploading file:', {
        originalName: file.originalname,
        fileName,
        filePath,
        size: file.size,
        type,
        folder
      });

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME || 'greenbeam')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('[FILE] Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME || 'greenbeam')
        .getPublicUrl(filePath);

      // Get image dimensions if it's an image
      let dimensions = null;
      if (file.mimetype.startsWith('image/')) {
        try {
          const sharp = require('sharp');
          const metadata = await sharp(file.buffer).metadata();
          dimensions = {
            width: metadata.width,
            height: metadata.height
          };
        } catch (error) {
          console.warn('[FILE] Could not get image dimensions:', error.message);
        }
      }

      // Save file record to database
      const fileRecord = await prisma.file.create({
        data: {
          filename: fileName,
          originalName: file.originalname,
          url: urlData.publicUrl,
          size: file.size,
          mimeType: file.mimetype,
          dimensions,
          type,
          folder,
          uploadedBy
        }
      });

      console.log('[FILE] File uploaded successfully:', {
        id: fileRecord.id,
        url: fileRecord.url
      });

      return {
        success: true,
        data: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          url: fileRecord.url,
          size: fileRecord.size,
          mimeType: fileRecord.mimeType,
          dimensions: fileRecord.dimensions,
          type: fileRecord.type,
          folder: fileRecord.folder,
          createdAt: fileRecord.createdAt
        }
      };
    } catch (error) {
      console.error('[FILE] Error uploading file:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(files, type = 'general', folder = 'general', uploadedBy = null) {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file, type, folder, uploadedBy)
      );

      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        data: results.map(result => result.data),
        message: `${results.length} files uploaded successfully`
      };
    } catch (error) {
      console.error('[FILE] Error uploading multiple files:', error);
      throw new Error(`Multiple file upload failed: ${error.message}`);
    }
  }

  // Get file by ID
  static async getFileById(id) {
    try {
      const file = await prisma.file.findUnique({
        where: { id }
      });

      if (!file) {
        throw new Error('File not found');
      }

      return {
        success: true,
        data: {
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          url: file.url,
          size: file.size,
          mimeType: file.mimeType,
          dimensions: file.dimensions,
          type: file.type,
          folder: file.folder,
          uploadedBy: file.uploadedBy,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }
      };
    } catch (error) {
      console.error('[FILE] Error fetching file:', error);
      throw error;
    }
  }

  // Get files with filters
  static async getFiles(filters = {}) {
    try {
      const { page = 1, limit = 20, type, folder, search } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where = {};
      if (type) where.type = type;
      if (folder) where.folder = folder;
      if (search) {
        where.OR = [
          { filename: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.file.count({ where })
      ]);

      return {
        success: true,
        data: {
          files: files.map(file => ({
            id: file.id,
            filename: file.filename,
            originalName: file.originalName,
            url: file.url,
            size: file.size,
            mimeType: file.mimeType,
            dimensions: file.dimensions,
            type: file.type,
            folder: file.folder,
            uploadedBy: file.uploadedBy,
            createdAt: file.createdAt
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('[FILE] Error fetching files:', error);
      throw new Error('Failed to fetch files');
    }
  }

  // Delete file
  static async deleteFile(id) {
    try {
      const file = await prisma.file.findUnique({
        where: { id }
      });

      if (!file) {
        throw new Error('File not found');
      }

      const supabase = global.supabase || require('../config/supabase');
      
      // Delete from Supabase storage
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME || 'greenbeam')
        .remove([`${file.folder}/${file.filename}`]);

      if (error) {
        console.error('[FILE] Supabase delete error:', error);
        throw new Error(`Storage delete failed: ${error.message}`);
      }

      // Delete from database
      await prisma.file.delete({
        where: { id }
      });

      console.log('[FILE] File deleted successfully:', {
        id,
        filename: file.filename
      });

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('[FILE] Error deleting file:', error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  // Get file statistics
  static async getFileStats() {
    try {
      const [totalFiles, totalSize, typeStats, folderStats] = await Promise.all([
        prisma.file.count(),
        prisma.file.aggregate({
          _sum: {
            size: true
          }
        }),
        prisma.file.groupBy({
          by: ['type'],
          _count: {
            id: true
          },
          _sum: {
            size: true
          }
        }),
        prisma.file.groupBy({
          by: ['folder'],
          _count: {
            id: true
          },
          _sum: {
            size: true
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalFiles,
          totalSize: totalSize._sum.size || 0,
          typeStats: typeStats.map(stat => ({
            type: stat.type,
            count: stat._count.id,
            size: stat._sum.size || 0
          })),
          folderStats: folderStats.map(stat => ({
            folder: stat.folder,
            count: stat._count.id,
            size: stat._sum.size || 0
          }))
        }
      };
    } catch (error) {
      console.error('[FILE] Error fetching file stats:', error);
      throw new Error('Failed to fetch file statistics');
    }
  }

  // Update file metadata
  static async updateFile(id, updateData) {
    try {
      const file = await prisma.file.findUnique({
        where: { id }
      });

      if (!file) {
        throw new Error('File not found');
      }

      const updatedFile = await prisma.file.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        data: {
          id: updatedFile.id,
          filename: updatedFile.filename,
          originalName: updatedFile.originalName,
          url: updatedFile.url,
          size: updatedFile.size,
          mimeType: updatedFile.mimeType,
          dimensions: updatedFile.dimensions,
          type: updatedFile.type,
          folder: updatedFile.folder,
          uploadedBy: updatedFile.uploadedBy,
          createdAt: updatedFile.createdAt,
          updatedAt: updatedFile.updatedAt
        }
      };
    } catch (error) {
      console.error('[FILE] Error updating file:', error);
      throw new Error(`File update failed: ${error.message}`);
    }
  }
}

module.exports = FileController; 