# Greenbeam API Setup Guide

This guide will help you set up and run the Greenbeam e-commerce API.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- SendGrid account (for email functionality)

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Run seed data
npm run db:seed
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/greenbeam_db"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# SendGrid Configuration
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@greenbeam.com
SENDGRID_FROM_NAME=Greenbeam Team

# Email Configuration
EMAIL_ENABLED=true
ADMIN_EMAIL=admin@greenbeam.com

# Logging
LOG_LEVEL=info
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Troubleshooting

### Port Already in Use (EADDRINUSE)

If you get the error `EADDRINUSE: address already in use :::3000`:

**Windows:**
```bash
# Find the process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Alternative: Change the port**
```env
PORT=3001
```

### SendGrid API Key Issues

If you see `API key does not start with "SG."`:

1. **Get a SendGrid API Key:**
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Go to Settings → API Keys
   - Create a new API key
   - Copy the key (it should start with "SG.")

2. **Update your .env file:**
   ```env
   SENDGRID_API_KEY=SG.your-actual-api-key-here
   ```

3. **Disable email functionality (for development):**
   ```env
   EMAIL_ENABLED=false
   ```

### Database Connection Issues

If you can't connect to the database:

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   net start postgresql

   # macOS
   brew services start postgresql

   # Linux
   sudo systemctl start postgresql
   ```

2. **Verify connection string:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/greenbeam_db"
   ```

3. **Create database if it doesn't exist:**
   ```sql
   CREATE DATABASE greenbeam_db;
   ```

## Testing the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Test Model System
```bash
node src/tests/modelTests.js
```

### 3. Create an Enquiry
```bash
curl -X POST http://localhost:3000/api/v1/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "product": "Solar Panel System",
    "subject": "Inquiry about solar installation",
    "message": "I am interested in installing solar panels on my home."
  }'
```

## Development Workflow

### Using the New Model System

1. **Controllers:** Use the service layer for business logic
2. **Routes:** Apply validation middleware
3. **Responses:** Use ResponseModel for consistent formatting

### Example Controller Usage:
```javascript
const { EnquiryService, ResponseModel } = require('../models');

// In your controller
const result = await EnquiryService.createEnquiry(data);
return res.status(201).json(result);
```

### Example Route Usage:
```javascript
router.post('/enquiries',
  validateRequest('enquiry', 'create'),
  EnquiryController.createEnquiry
);
```

## Production Deployment

### 1. Environment Variables
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up production database

### 2. Security
- Change default JWT secret
- Use HTTPS
- Configure proper rate limiting
- Set up monitoring and logging

### 3. Database
- Use connection pooling
- Set up backups
- Configure proper indexes

## API Documentation

The API provides the following endpoints:

- `POST /api/v1/enquiries` - Create enquiry
- `GET /api/v1/enquiries` - List enquiries
- `GET /api/v1/enquiries/:id` - Get enquiry details
- `PATCH /api/v1/enquiries/:id/status` - Update enquiry status
- `POST /api/v1/enquiries/:id/respond` - Respond to enquiry
- `GET /api/v1/products` - List products
- `GET /api/v1/dashboard/stats` - Dashboard statistics

For detailed API documentation, see the individual route files and the models guide. 