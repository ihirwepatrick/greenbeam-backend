# Greenbeam API Documentation

A comprehensive e-commerce API for solar energy products with enquiry management, product catalog, and admin dashboard.

## Table of Contents

- [Setup](#setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [Authentication](#authentication-endpoints)
  - [Enquiries](#enquiry-endpoints)
  - [Products](#product-endpoints)
  - [Dashboard](#dashboard-endpoints)
- [Testing with Postman](#testing-with-postman)
- [Environment Variables](#environment-variables)

## Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Supabase account (for image storage)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd greenbeam-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start the server
npm run dev
```

## Authentication

Most endpoints require authentication. Use the JWT token from login/register responses in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### Health Check

#### GET /health
**Description:** Check if the API is running

**Request:**
```http
GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

### Authentication Endpoints

#### POST /api/v1/auth/register
**Description:** Register a new admin user

**Request:**
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@greenbeam.com",
  "password": "admin123456",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@greenbeam.com",
    "role": "ADMIN",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /api/v1/auth/login
**Description:** Login to get JWT token

**Request:**
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@greenbeam.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@greenbeam.com",
      "role": "ADMIN",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

---

### Enquiry Endpoints

#### POST /api/v1/enquiries
**Description:** Create a new enquiry (Public endpoint)

**Request:**
```http
POST http://localhost:3000/api/v1/enquiries
Content-Type: application/json

{
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "product": "Solar Panel System",
  "subject": "Inquiry about solar installation",
  "message": "I am interested in installing solar panels on my home. Please provide more information about pricing and installation process.",
  "source": "Website Form",
  "location": "New York, NY",
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "product": "Solar Panel System",
    "subject": "Inquiry about solar installation",
    "message": "I am interested in installing solar panels...",
    "status": "NEW",
    "priority": "HIGH",
    "source": "Website Form",
    "location": "New York, NY",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/v1/enquiries
**Description:** Get all enquiries with pagination and filters (Admin only)

**Request:**
```http
GET http://localhost:3000/api/v1/enquiries?page=1&limit=10&search=solar&status=NEW&priority=HIGH
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enquiries": [
      {
        "id": 1,
        "customerName": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "product": "Solar Panel System",
        "subject": "Inquiry about solar installation",
        "message": "I am interested in installing solar panels...",
        "status": "NEW",
        "priority": "HIGH",
        "source": "Website Form",
        "location": "New York, NY",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "lastResponse": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### GET /api/v1/enquiries/:id
**Description:** Get enquiry by ID (Admin only)

**Request:**
```http
GET http://localhost:3000/api/v1/enquiries/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "product": "Solar Panel System",
    "subject": "Inquiry about solar installation",
    "message": "I am interested in installing solar panels...",
    "status": "NEW",
    "priority": "HIGH",
    "source": "Website Form",
    "location": "New York, NY",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "responses": []
  }
}
```

#### PATCH /api/v1/enquiries/:id/status
**Description:** Update enquiry status (Admin only)

**Request:**
```http
PATCH http://localhost:3000/api/v1/enquiries/1/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "IN_PROGRESS",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### POST /api/v1/enquiries/:id/respond
**Description:** Respond to an enquiry (Admin only)

**Request:**
```http
POST http://localhost:3000/api/v1/enquiries/1/respond
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "message": "Thank you for your inquiry about our solar panel system. We would be happy to provide you with a detailed quote. Our team will contact you within 24 hours to schedule a consultation.",
  "sendEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enquiryId": 1,
    "response": {
      "id": 1,
      "message": "Thank you for your inquiry about our solar panel system...",
      "sentBy": "Admin",
      "sentAt": "2024-01-15T10:40:00.000Z",
      "emailSent": true
    }
  }
}
```

---

### Product Endpoints

#### GET /api/v1/products/test-storage
**Description:** Test Supabase storage access

**Request:**
```http
GET http://localhost:3000/api/v1/products/test-storage
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "accessible": true,
    "bucketExists": true,
    "bucketName": "greenbeam"
  },
  "message": "Storage access test completed"
}
```

#### POST /api/v1/products
**Description:** Create a new product with images (Admin only)

**Request:**
```http
POST http://localhost:3000/api/v1/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

# Form Data:
name: Premium Solar Panel 400W
category: Solar Panels
description: High-efficiency monocrystalline solar panel with 21.5% efficiency rating. Perfect for residential and commercial installations.
features: ["21.5% Efficiency", "Weather Resistant", "25 Year Warranty", "Monocrystalline Technology"]
specifications: {"power": "400W", "efficiency": "21.5%", "dimensions": "1765 x 1048 x 35mm", "weight": "19.5kg"}
status: AVAILABLE
image: [select main image file]
images: [select additional image 1]
images: [select additional image 2]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Premium Solar Panel 400W",
    "category": "Solar Panels",
    "description": "High-efficiency monocrystalline solar panel...",
    "image": "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324000_abc123.jpg",
    "features": ["21.5% Efficiency", "Weather Resistant", "25 Year Warranty"],
    "specifications": {
      "power": "400W",
      "efficiency": "21.5%",
      "dimensions": "1765 x 1048 x 35mm"
    },
    "rating": 0,
    "reviews": 0,
    "status": "AVAILABLE",
    "images": [
      "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324001_def456.jpg",
      "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324002_ghi789.jpg"
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/v1/products
**Description:** Get all products with pagination and filters

**Request:**
```http
GET http://localhost:3000/api/v1/products?page=1&limit=10&search=solar&category=Solar Panels&status=AVAILABLE
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Premium Solar Panel 400W",
        "category": "Solar Panels",
        "description": "High-efficiency monocrystalline solar panel...",
        "image": "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324000_abc123.jpg",
        "features": ["21.5% Efficiency", "Weather Resistant", "25 Year Warranty"],
        "rating": 0,
        "reviews": 0,
        "status": "AVAILABLE",
        "images": [
          "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324001_def456.jpg"
        ],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

#### GET /api/v1/products/:id
**Description:** Get product by ID

**Request:**
```http
GET http://localhost:3000/api/v1/products/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Premium Solar Panel 400W",
    "category": "Solar Panels",
    "description": "High-efficiency monocrystalline solar panel...",
    "image": "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324000_abc123.jpg",
    "features": ["21.5% Efficiency", "Weather Resistant", "25 Year Warranty"],
    "specifications": {
      "power": "400W",
      "efficiency": "21.5%",
      "dimensions": "1765 x 1048 x 35mm"
    },
    "rating": 0,
    "reviews": 0,
    "status": "AVAILABLE",
    "images": [
      "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324001_def456.jpg"
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### PUT /api/v1/products/:id
**Description:** Update product with images (Admin only)

**Request:**
```http
PUT http://localhost:3000/api/v1/products/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

# Form Data:
name: Updated Solar Panel
description: Updated description with better efficiency
image: [select new main image file - optional]
images: [select new additional image 1 - optional]
images: [select new additional image 2 - optional]
# Note: Additional images will REPLACE existing images, not append to them
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Solar Panel",
    "category": "Solar Panels",
    "description": "Updated description with better efficiency",
    "image": "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324100_new123.jpg",
    "features": ["21.5% Efficiency", "Weather Resistant", "25 Year Warranty"],
    "specifications": {
      "power": "400W",
      "efficiency": "21.5%",
      "dimensions": "1765 x 1048 x 35mm"
    },
    "rating": 0,
    "reviews": 0,
    "status": "AVAILABLE",
    "images": [
      "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324101_new456.jpg",
      "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324102_new789.jpg"
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

**Important Notes:**
- **Main Image**: If provided, replaces the existing main image
- **Additional Images**: If provided, completely replaces all existing additional images
- **No Images**: If no images are provided, existing images are kept unchanged
- **Partial Update**: You can update just the text fields without providing any images

#### DELETE /api/v1/products/:id
**Description:** Delete product (Admin only)

**Request:**
```http
DELETE http://localhost:3000/api/v1/products/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### GET /api/v1/products/categories/all
**Description:** Get all product categories

**Request:**
```http
GET http://localhost:3000/api/v1/products/categories/all
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Solar Panels",
    "Inverters",
    "Battery Storage",
    "Mounting Systems",
    "Charge Controllers",
    "Solar Pumps",
    "Solar Lighting",
    "Cables & Connectors"
  ]
}
```

#### POST /api/v1/products/:id/rate
**Description:** Rate a product

**Request:**
```http
POST http://localhost:3000/api/v1/products/1/rate
Content-Type: application/json

{
  "rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rating": 5,
    "reviews": 1
  }
}
```

---

### Dashboard Endpoints

#### GET /api/v1/dashboard/stats
**Description:** Get dashboard statistics (Admin only)

**Request:**
```http
GET http://localhost:3000/api/v1/dashboard/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEnquiries": 150,
    "newEnquiries": 25,
    "inProgressEnquiries": 15,
    "respondedEnquiries": 80,
    "closedEnquiries": 30,
    "highPriorityEnquiries": 10,
    "totalProducts": 45,
    "availableProducts": 40,
    "totalUsers": 12,
    "recentEnquiries": [
      {
        "id": 1,
        "customerName": "John Doe",
        "subject": "Solar Panel Inquiry",
        "status": "NEW",
        "priority": "HIGH",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "monthlyStats": {
      "january": 45,
      "february": 52,
      "march": 38
    }
  }
}
```

---

## Testing with Postman

### Setup Postman Collection

1. **Create a new collection** called "Greenbeam API"
2. **Set up environment variables:**
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set after login)

### Authentication Flow

1. **Register Admin:**
   - Method: POST
   - URL: `{{base_url}}/api/v1/auth/register`
   - Body: Raw JSON (use register test data)

2. **Login:**
   - Method: POST
   - URL: `{{base_url}}/api/v1/auth/login`
   - Body: Raw JSON (use login test data)
   - **Save the token** from response to environment variable

3. **Use token in subsequent requests:**
   - Add header: `Authorization: Bearer {{token}}`

### File Upload Testing

For product creation with images:

1. **Select "Body" tab**
2. **Choose "form-data"**
3. **Add text fields** for product data
4. **Add file fields:**
   - Key: `image` (Type: File) - for main image
   - Key: `images` (Type: File) - for additional images (can add multiple)

### Test Data Examples

#### Product Categories
- Solar Panels
- Inverters
- Battery Storage
- Mounting Systems
- Charge Controllers
- Solar Pumps
- Solar Lighting
- Cables & Connectors

#### Enquiry Priorities
- HIGH
- MEDIUM
- LOW

#### Enquiry Statuses
- NEW
- IN_PROGRESS
- RESPONDED
- CLOSED

#### Product Statuses
- AVAILABLE
- NOT_AVAILABLE

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/greenbeam_db"

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET_NAME=greenbeam

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Resend (email) Configuration
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Greenbeam Team
RESEND_REPLY_TO=

# Email Configuration
EMAIL_ENABLED=true
ADMIN_EMAIL=admin@greenbeam.com

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  },
  "statusCode": 400
}
```

### Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token required"
  },
  "statusCode": 401
}
```

### Not Found Error
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  },
  "statusCode": 404
}
```

### Upload Error
```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_ERROR",
    "message": "File upload failed",
    "details": "File size too large. Maximum size is 20MB."
  },
  "statusCode": 500
}
```

---

## Support

For issues and questions:
1. Check the console logs for detailed error messages
2. Verify your environment variables are set correctly
3. Ensure Supabase bucket is configured properly
4. Check database connection and schema

## License

This project is licensed under the MIT License.