# Greenbeam Settings & File Upload API Documentation

## Overview
Comprehensive API endpoints for managing system settings, website configuration, and file uploads for the Greenbeam admin portal.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
```http
Authorization: Bearer <your-access-token>
```

---

## 1. Settings Management

### 1.1 Initialize Default Settings
```http
POST /settings/initialize
```
**Description:** Initialize the system with default settings (admin only)

**Response:**
```json
{
  "success": true,
  "message": "Default settings initialized successfully"
}
```

### 1.2 Get All Settings
```http
GET /settings
```
**Description:** Get all settings grouped by category (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "companyName": "Greenbeam",
      "companyEmail": "info@greenbeam.com",
      "companyPhone": "+250 788 123 456",
      "companyAddress": "Kigali, Rwanda",
      "timezone": "Africa/Kigali",
      "currency": "RWF",
      "language": "en",
      "dateFormat": "DD/MM/YYYY",
      "timeFormat": "24h"
    },
    "email": {
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUser": "noreply@greenbeam.com",
      "smtpPassword": "",
      "fromName": "Greenbeam Team",
      "fromEmail": "noreply@greenbeam.com",
      "replyTo": "support@greenbeam.com"
    },
    "notifications": {
      "emailNotifications": true,
      "adminEmail": "admin@greenbeam.com",
      "enquiryNotifications": true,
      "systemNotifications": true,
      "notificationFrequency": "immediate"
    },
    "security": {
      "sessionTimeout": 3600,
      "maxLoginAttempts": 5,
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumbers": true,
        "requireSpecialChars": true
      },
      "twoFactorAuth": false
    },
    "backup": {
      "autoBackup": true,
      "backupFrequency": "daily",
      "backupRetention": 30,
      "backupLocation": "cloud"
    }
  }
}
```

### 1.3 Get Settings by Category
```http
GET /settings/{category}
```
**Description:** Get settings for a specific category (admin only)

**Categories:** `general`, `email`, `notifications`, `security`, `backup`, `website`

**Example:**
```http
GET /settings/general
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyName": "Greenbeam",
    "companyEmail": "info@greenbeam.com",
    "companyPhone": "+250 788 123 456",
    "companyAddress": "Kigali, Rwanda",
    "timezone": "Africa/Kigali",
    "currency": "RWF",
    "language": "en",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h"
  }
}
```

### 1.4 Update Settings by Category
```http
PUT /settings/{category}
```
**Description:** Update all settings for a category (admin only)

**Example:**
```http
PUT /settings/general
Content-Type: application/json

{
  "companyName": "Greenbeam Solutions",
  "companyEmail": "info@greenbeam.com",
  "companyPhone": "+250 788 123 456",
  "companyAddress": "Kigali, Rwanda",
  "timezone": "Africa/Kigali",
  "currency": "RWF",
  "language": "en",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h"
}
```

### 1.5 Update Single Setting
```http
PUT /settings/{category}/{key}
```
**Description:** Update a single setting (admin only)

**Example:**
```http
PUT /settings/general/companyName
Content-Type: application/json

{
  "value": "Greenbeam Solutions"
}
```

### 1.6 Delete Setting
```http
DELETE /settings/{category}/{key}
```
**Description:** Delete a single setting (admin only)

---

## 2. Website Settings Management

### 2.1 Get Website Settings (Flattened)
```http
GET /settings/website/flattened
```
**Description:** Get website settings in flattened structure (admin only)

### 2.2 Update Website Settings (Nested)
```http
PUT /settings/website/nested
```
**Description:** Update website settings with nested structure (admin only)

### 2.3 Branding Settings

#### Get Branding Settings
```http
GET /settings/website/branding
```

#### Update Branding Settings
```http
PUT /settings/website/branding
Content-Type: application/json

{
  "logo": "https://storage.greenbeam.com/logo.png",
  "favicon": "https://storage.greenbeam.com/favicon.ico",
  "primaryColor": "#0a6650",
  "secondaryColor": "#084c3d",
  "accentColor": "#10b981",
  "fontFamily": "Inter",
  "fontSize": "16px",
  "buttonStyle": "rounded",
  "borderRadius": "8px"
}
```

### 2.4 Content Settings

#### Get Content Settings
```http
GET /settings/website/content
```

#### Update Content Settings
```http
PUT /settings/website/content
Content-Type: application/json

{
  "siteTitle": "Greenbeam - Sustainable Energy Solutions",
  "siteDescription": "Leading provider of solar energy solutions in Rwanda",
  "homepageHero": {
    "title": "Powering Rwanda's Future",
    "subtitle": "Sustainable solar energy solutions for homes and businesses",
    "ctaText": "Explore Products",
    "ctaLink": "/products",
    "backgroundImage": "https://storage.greenbeam.com/hero-bg.jpg",
    "showOverlay": true,
    "overlayOpacity": 0.6
  },
  "aboutSection": {
    "title": "About Greenbeam",
    "content": "We are committed to providing sustainable energy solutions...",
    "showTeam": true,
    "showStats": true,
    "stats": [
      {
        "label": "Projects Completed",
        "value": "500+",
        "icon": "check-circle"
      },
      {
        "label": "Happy Customers",
        "value": "1000+",
        "icon": "users"
      }
    ]
  },
  "contactInfo": {
    "address": "Kigali, Rwanda",
    "phone": "+250 788 123 456",
    "email": "info@greenbeam.com",
    "workingHours": "Mon-Fri: 8AM-6PM",
    "mapLocation": {
      "latitude": -1.9441,
      "longitude": 30.0619,
      "zoom": 15
    },
    "showMap": true,
    "showContactForm": true
  },
  "footer": {
    "showNewsletter": true,
    "newsletterTitle": "Stay Updated",
    "newsletterDescription": "Get the latest updates on our products and services",
    "showSocialLinks": true,
    "copyrightText": "© 2024 Greenbeam. All rights reserved."
  }
}
```

### 2.5 SEO Settings

#### Get SEO Settings
```http
GET /settings/website/seo
```

#### Update SEO Settings
```http
PUT /settings/website/seo
Content-Type: application/json

{
  "metaTitle": "Greenbeam - Solar Energy Solutions Rwanda",
  "metaDescription": "Leading solar energy provider in Rwanda. Sustainable solutions for homes and businesses.",
  "metaKeywords": "solar energy, Rwanda, renewable energy, solar panels",
  "ogImage": "https://storage.greenbeam.com/og-image.jpg",
  "twitterCard": "summary_large_image",
  "googleAnalyticsId": "GA-123456789",
  "googleTagManagerId": "GTM-ABCDEF",
  "sitemapEnabled": true,
  "robotsTxt": "User-agent: *\nAllow: /"
}
```

### 2.6 Social Media Settings

#### Get Social Settings
```http
GET /settings/website/social
```

#### Update Social Settings
```http
PUT /settings/website/social
Content-Type: application/json

{
  "facebook": "https://facebook.com/greenbeam",
  "twitter": "https://twitter.com/greenbeam",
  "linkedin": "https://linkedin.com/company/greenbeam",
  "instagram": "https://instagram.com/greenbeam",
  "youtube": "https://youtube.com/greenbeam",
  "showSocialIcons": true,
  "socialIconsPosition": "footer",
  "socialShareEnabled": true
}
```

### 2.7 Feature Settings

#### Get Feature Settings
```http
GET /settings/website/features
```

#### Update Feature Settings
```http
PUT /settings/website/features
Content-Type: application/json

{
  "enableBlog": true,
  "enableNewsletter": true,
  "enableReviews": false,
  "enableChat": true,
  "enableSearch": true,
  "enableFilters": true,
  "productsPerPage": 12,
  "enablePagination": true,
  "enableRelatedProducts": true,
  "enableProductComparison": false,
  "enableWishlist": false,
  "enableProductCategories": true,
  "enableProductTags": true
}
```

### 2.8 Layout Settings

#### Get Layout Settings
```http
GET /settings/website/layout
```

#### Update Layout Settings
```http
PUT /settings/website/layout
Content-Type: application/json

{
  "headerStyle": "fixed",
  "showBreadcrumbs": true,
  "sidebarPosition": "right",
  "productGridColumns": 3,
  "showProductImages": true,
  "imageAspectRatio": "16:9",
  "enableLazyLoading": true,
  "showLoadingSpinner": true
}
```

### 2.9 Performance Settings

#### Get Performance Settings
```http
GET /settings/website/performance
```

#### Update Performance Settings
```http
PUT /settings/website/performance
Content-Type: application/json

{
  "enableCaching": true,
  "cacheDuration": 3600,
  "enableCompression": true,
  "enableCDN": true,
  "cdnUrl": "https://cdn.greenbeam.com",
  "imageOptimization": true,
  "lazyLoadImages": true
}
```

### 2.10 Customization Settings

#### Get Customization Settings
```http
GET /settings/website/customization
```

#### Update Customization Settings
```http
PUT /settings/website/customization
Content-Type: application/json

{
  "customCSS": "",
  "customJS": "",
  "enableCustomThemes": false,
  "themeMode": "light",
  "enableDarkMode": false,
  "customFonts": [],
  "enableAnimations": true,
  "animationSpeed": "normal"
}
```

---

## 3. File Upload Management

### 3.1 Upload Single File
```http
POST /upload/single
```
**Description:** Upload a single file (admin only)

**Request Body (multipart/form-data):**
```
file: [file]
type: product_image
folder: products
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-123",
    "filename": "solar-panel.jpg",
    "url": "https://storage.greenbeam.com/products/solar-panel.jpg",
    "size": 2048576,
    "mimeType": "image/jpeg",
    "dimensions": {"width": 1920, "height": 1080},
    "type": "product_image",
    "folder": "products",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3.2 Upload Multiple Files
```http
POST /upload/multiple
```
**Description:** Upload multiple files (admin only)

**Request Body (multipart/form-data):**
```
files: [file1, file2, file3]
type: product_gallery
folder: products
```

### 3.3 Upload Files with Specific Fields
```http
POST /upload/fields
```
**Description:** Upload files with specific field names (admin only)

**Request Body (multipart/form-data):**
```
logo: [file]
favicon: [file]
heroImage: [file]
gallery: [file1, file2, file3]
documents: [file1, file2]
```

### 3.4 Get File by ID
```http
GET /upload/{fileId}
```
**Description:** Get file information by ID (admin only)

### 3.5 Get Files with Filters
```http
GET /upload?page=1&limit=20&type=product_image&folder=products&search=solar
```
**Description:** Get files with pagination and filters (admin only)

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page (max 100)
- `type` (string): Filter by file type
- `folder` (string): Filter by folder
- `search` (string): Search in filename or original name

### 3.6 Delete File
```http
DELETE /upload/{fileId}
```
**Description:** Delete a file (admin only)

### 3.7 Update File Metadata
```http
PUT /upload/{fileId}
```
**Description:** Update file metadata (admin only)

**Request Body:**
```json
{
  "type": "product_image",
  "folder": "products"
}
```

### 3.8 Get File Statistics
```http
GET /upload/stats/overview
```
**Description:** Get file upload statistics (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 150,
    "totalSize": 52428800,
    "typeStats": [
      {
        "type": "product_image",
        "count": 45,
        "size": 15728640
      },
      {
        "type": "document",
        "count": 25,
        "size": 10485760
      }
    ],
    "folderStats": [
      {
        "folder": "products",
        "count": 60,
        "size": 20971520
      },
      {
        "folder": "documents",
        "count": 30,
        "size": 10485760
      }
    ]
  }
}
```

---

## 4. Test Data Examples

### 4.1 General Settings Test Data
```json
{
  "companyName": "Greenbeam Solutions",
  "companyEmail": "info@greenbeam.com",
  "companyPhone": "+250 788 123 456",
  "companyAddress": "Kigali, Rwanda",
  "timezone": "Africa/Kigali",
  "currency": "RWF",
  "language": "en",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h"
}
```

### 4.2 Email Settings Test Data
```json
{
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUser": "noreply@greenbeam.com",
  "smtpPassword": "your_password_here",
  "fromName": "Greenbeam Team",
  "fromEmail": "noreply@greenbeam.com",
  "replyTo": "support@greenbeam.com"
}
```

### 4.3 Security Settings Test Data
```json
{
  "sessionTimeout": 3600,
  "maxLoginAttempts": 5,
  "passwordPolicy": {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": true
  },
  "twoFactorAuth": false
}
```

### 4.4 Branding Settings Test Data
```json
{
  "logo": "https://storage.greenbeam.com/logo.png",
  "favicon": "https://storage.greenbeam.com/favicon.ico",
  "primaryColor": "#0a6650",
  "secondaryColor": "#084c3d",
  "accentColor": "#10b981",
  "fontFamily": "Inter",
  "fontSize": "16px",
  "buttonStyle": "rounded",
  "borderRadius": "8px"
}
```

---

## 5. Error Responses

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token required"
  }
}
```

### File Upload Error
```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_ERROR",
    "message": "File upload failed",
    "details": "File size too large. Maximum size is 20MB."
  }
}
```

### File Not Found Error
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found"
  }
}
```

---

## 6. Setup Instructions

### 6.1 Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

### 6.2 Initialize Settings
```bash
# First, login to get admin token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@greenbeam.com", "password": "admin123456"}'

# Then initialize default settings
curl -X POST http://localhost:3000/api/v1/settings/initialize \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6.3 Test File Upload
```bash
# Upload a single file
curl -X POST http://localhost:3000/api/v1/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "type=product_image" \
  -F "folder=products"
```

---

## 7. Security Considerations

1. **Authentication Required**: All settings and upload endpoints require admin authentication
2. **File Type Validation**: Only allowed file types can be uploaded
3. **File Size Limits**: Maximum file size is 20MB
4. **Input Validation**: All settings data is validated before storage
5. **SQL Injection Protection**: Using Prisma ORM with parameterized queries
6. **XSS Protection**: Input sanitization for all text fields
7. **CSRF Protection**: Implement CSRF tokens for form submissions
8. **HTTPS**: Use HTTPS for all communications in production
9. **Data Encryption**: Sensitive data is encrypted at rest
10. **Access Control**: Proper authorization checks for all operations

---

## 8. Performance Optimization

1. **Caching**: Implement Redis caching for frequently accessed settings
2. **Database Optimization**: Use proper indexing on settings table
3. **CDN**: Use CDN for file storage and delivery
4. **Image Optimization**: Automatic image compression and resizing
5. **Lazy Loading**: Implement lazy loading for file galleries
6. **Pagination**: Proper pagination for file listings
7. **Compression**: Enable gzip compression for API responses
8. **Connection Pooling**: Use database connection pooling
9. **File Cleanup**: Regular cleanup of orphaned files
10. **Monitoring**: Implement performance monitoring and logging 