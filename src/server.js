require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://putkiapvvlebelkafwbe.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dGtpYXB2dmxlYmVsa2Fmd2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5OTI5MjQsImV4cCI6MjA2MDU2ODkyNH0.0lkWoaKuYpatk8yyGnFonBOK8qRa-nvspnBYQa0A2dQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Import routes
const enquiryRoutes = require('./routes/enquiries');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

// Import database
const prisma = require('./models');

const app = express();

// Initialize Supabase bucket check
async function checkSupabaseBucket() {
  try {
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'greenbeam';
    console.log(`Checking Supabase bucket: '${bucketName}'`);
    
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking Supabase buckets:', error.message);
      return;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`✅ Supabase bucket '${bucketName}' found and ready for use.`);
    } else {
      console.warn(`⚠️ Warning: Bucket '${bucketName}' not found. Please create it manually in the Supabase dashboard.`);
    }
  } catch (error) {
    console.error('Error checking Supabase storage:', error.message);
  }
}

// Check Supabase bucket on startup
checkSupabaseBucket();

// Basic middleware
app.use(helmet({
    contentSecurityPolicy: false // For development only
}));

// Apply CORS before any route definitions
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001', 
           'http://127.0.0.1:3001', 'http://192.168.56.1:3001', 
           'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Access-Control-Allow-Headers']
}));

// Add a preflight handler for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Export Supabase client for use in other files
app.locals.supabase = supabase;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1/enquiries', enquiryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Error Handling Middleware
const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route not found - ${req.originalUrl}`
    });
};

app.use(notFoundHandler);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }
  });
});

// Server setup with port handling
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Check if port is in use
        const server = app.listen(PORT, () => {
            console.log(`🚀 Greenbeam API server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
                server.close();
                app.listen(PORT + 1);
            } else {
                console.error('Server error:', error);
            }
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Closing HTTP server and database connection...');
            server.close(async () => {
                await prisma.$disconnect();
                console.log('Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app; 