const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Filter function for file types
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instance with optimized settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Middleware to handle file upload to Supabase
const handleSupabaseUpload = async (req, res, next) => {
  try {
    // Skip if no files uploaded
    if (!req.files && !req.file) {
      console.log('[UPLOAD] No files uploaded, skipping processing');
      return next();
    }

    // Get supabase instance from app.locals
    const supabase = req.app.locals.supabase;
    
    if (!supabase) {
      console.error('[UPLOAD] Supabase client not available');
      return res.status(500).json({
        success: false,
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: 'Storage service unavailable'
        }
      });
    }

    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'greenbeam';
    
    // Handle single file upload (from upload.single)
    if (req.file) {
      console.log(`[UPLOAD] Processing single file: ${req.file.originalname}`);
      
      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${uuidv4()}${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log(`[UPLOAD] Uploading to Supabase bucket: ${bucketName}`);
      console.log(`[UPLOAD] File path: ${filePath}`);
      
      // Upload file to Supabase with timeout
      const uploadPromise = supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      );

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

      if (error) {
        console.error('[UPLOAD] Supabase upload error:', error);
        
        // Handle RLS policy error specifically
        if (error.message.includes('row-level security policy')) {
          return res.status(500).json({
            success: false,
            error: {
              code: 'RLS_POLICY_ERROR',
              message: 'Storage access denied. Please check Supabase bucket policies.',
              details: 'The bucket has RLS enabled but no policies allow uploads. Please disable RLS or create upload policies.'
            }
          });
        }
        
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: 'Error uploading file to storage',
            details: error.message
          }
        });
      }

      // Get public URL 
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      console.log('[UPLOAD] File uploaded successfully to Supabase:', urlData.publicUrl);
      
      // Add file info to request
      req.file.filename = fileName;
      req.file.path = filePath;
      req.file.supabaseUrl = urlData.publicUrl;
    }

    // Handle multiple files upload (from upload.fields)
    if (req.files) {
      console.log(`[UPLOAD] Processing files from fields:`, Object.keys(req.files));
      
      // Process files in parallel for better performance
      const uploadPromises = [];
      
      // Process each field
      for (const [fieldName, files] of Object.entries(req.files)) {
        console.log(`[UPLOAD] Processing field '${fieldName}' with ${files.length} files`);
        
        for (const file of files) {
          console.log(`[UPLOAD] Processing file: ${file.originalname}`);
          
          const fileExt = path.extname(file.originalname);
          const fileName = `${Date.now()}-${uuidv4()}${fileExt}`;
          const filePath = `products/${fileName}`;

          console.log(`[UPLOAD] Uploading to Supabase bucket: ${bucketName}`);
          console.log(`[UPLOAD] File path: ${filePath}`);
          
          // Create upload promise
          const uploadPromise = supabase.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false
            })
            .then(({ data, error }) => {
              if (error) {
                throw error;
              }
              
              // Get public URL 
              const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);
                
              console.log('[UPLOAD] File uploaded successfully to Supabase:', urlData.publicUrl);
              
              // Add file info
              file.filename = fileName;
              file.path = filePath;
              file.supabaseUrl = urlData.publicUrl;
              
              return { file, urlData };
            });

          uploadPromises.push(uploadPromise);
        }
      }
      
      // Wait for all uploads to complete
      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('[UPLOAD] Batch upload error:', error);
        
        // Handle RLS policy error specifically
        if (error.message.includes('row-level security policy')) {
          return res.status(500).json({
            success: false,
            error: {
              code: 'RLS_POLICY_ERROR',
              message: 'Storage access denied. Please check Supabase bucket policies.',
              details: 'The bucket has RLS enabled but no policies allow uploads. Please disable RLS or create upload policies.'
            }
          });
        }
        
        return res.status(500).json({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: 'Error uploading files to storage',
            details: error.message
          }
        });
      }
    }
    
    console.log('[UPLOAD] File processing completed successfully');
    next();
  } catch (error) {
    console.error('[UPLOAD] File upload error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'File upload failed',
        details: error.message
      }
    });
  }
};

// Middleware that combines multer and Supabase upload
const uploadMiddleware = {
  single: (fieldName) => [upload.single(fieldName), handleSupabaseUpload],
  array: (fieldName, maxCount) => [upload.array(fieldName, maxCount), handleSupabaseUpload],
  fields: (fields) => [upload.fields(fields), handleSupabaseUpload]
};

module.exports = uploadMiddleware; 