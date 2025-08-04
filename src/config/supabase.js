const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Bucket configuration
const BUCKET_NAME = 'greenbeam';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

class SupabaseService {
  // Upload single image to Supabase bucket
  static async uploadImage(file, folder = 'products') {
    try {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size too large. Maximum size is 20MB.');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${timestamp}_${randomString}.${fileExtension}`;

      // Upload to Supabase with RLS bypass
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Handle RLS policy errors
        if (error.message.includes('row-level security policy')) {
          throw new Error('Storage access denied. Please check Supabase bucket policies and ensure the bucket is public or RLS policies allow uploads.');
        }
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Upload multiple images
  static async uploadMultipleImages(files, folder = 'products') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        images: results
      };
    } catch (error) {
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  }

  // Delete image from Supabase bucket
  static async deleteImage(filePath) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        // Handle RLS policy errors
        if (error.message.includes('row-level security policy')) {
          console.warn('Storage delete access denied. File may remain in storage.');
          return { success: false, warning: 'Delete access denied' };
        }
        throw new Error(`Delete failed: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  // Delete multiple images
  static async deleteMultipleImages(filePaths) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (error) {
        // Handle RLS policy errors
        if (error.message.includes('row-level security policy')) {
          console.warn('Storage delete access denied. Files may remain in storage.');
          return { success: false, warning: 'Delete access denied' };
        }
        throw new Error(`Delete failed: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Multiple image deletion failed: ${error.message}`);
    }
  }

  // Get image URL from path
  static getImageUrl(filePath) {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // Validate file
  static validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return errors;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push('File size too large. Maximum size is 20MB.');
    }

    return errors;
  }

  // Check bucket access
  static async checkBucketAccess() {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });

      if (error) {
        if (error.message.includes('row-level security policy')) {
          throw new Error('Bucket access denied. Please check RLS policies.');
        }
        throw new Error(`Bucket access failed: ${error.message}`);
      }

      return { success: true, accessible: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = { supabase, SupabaseService }; 