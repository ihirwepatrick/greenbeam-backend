# Greenbeam E-commerce API Backend

A comprehensive Node.js backend API for the Greenbeam e-commerce platform, built with Express.js, Prisma ORM, and PostgreSQL. This API provides complete functionality for managing enquiries, products, notifications, and email services for a green energy products business.

## 🚀 Features

- **Enquiry Management**: Complete CRUD operations for customer enquiries
- **Product Catalog**: Product management with categories, ratings, and specifications
- **Email Service**: Automated email notifications using SendGrid
- **Notification System**: Real-time notifications for admin dashboard
- **Authentication**: JWT-based authentication with role-based access control
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **API Documentation**: RESTful API with comprehensive endpoints
- **Security**: Input validation, rate limiting, CORS, and security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Email Service**: SendGrid
- **Validation**: Joi
- **Security**: bcryptjs, helmet, cors
- **Rate Limiting**: express-rate-limit

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd greenbeam-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/greenbeam_db"

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@greenbeam.com
SENDGRID_FROM_NAME=Greenbeam

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=7d

# Admin Configuration
ADMIN_EMAIL=admin@greenbeam.com
ADMIN_PASSWORD=admin123

# API Configuration
API_BASE_URL=https://api.greenbeam.com/v1
CORS_ORIGIN=https://greenbeam.com
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require authentication using Bearer tokens:

```http
Authorization: Bearer <your-access-token>
```

### Core Endpoints

#### Enquiries

- `POST /enquiries` - Create new enquiry (public)
- `GET /enquiries` - Get all enquiries (admin)
- `GET /enquiries/:id` - Get enquiry by ID (admin)
- `PATCH /enquiries/:id/status` - Update enquiry status (admin)
- `POST /enquiries/:id/respond` - Respond to enquiry (admin)
- `DELETE /enquiries/:id` - Delete enquiry (admin)

#### Products

- `GET /products` - Get all products (public)
- `GET /products/:id` - Get product by ID (public)
- `POST /products` - Create new product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)
- `GET /products/categories/list` - Get product categories (public)
- `POST /products/:id/rate` - Rate a product (public)

#### Notifications

- `GET /notifications` - Get notifications (admin)
- `PATCH /notifications/:id/read` - Mark notification as read (admin)
- `PATCH /notifications/read-all` - Mark all notifications as read (admin)
- `DELETE /notifications/:id` - Delete notification (admin)
- `GET /notifications/stats` - Get notification statistics (admin)

#### Email Service

- `POST /email/send` - Send email (admin)
- `GET /email/logs` - Get email logs (admin)
- `GET /email/stats` - Get email statistics (admin)
- `POST /email/resend/:id` - Resend failed email (admin)
- `POST /email/test` - Test email configuration (admin)

#### Dashboard

- `GET /dashboard/stats` - Get dashboard statistics (admin)
- `GET /dashboard/charts` - Get chart data for analytics (admin)
- `GET /dashboard/activity` - Get recent activity (admin)

#### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `POST /auth/change-password` - Change password
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start            # Start production server
npm run build        # Generate Prisma client

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## 📊 Database Schema

The application uses the following main entities:

- **Enquiries**: Customer enquiries with status tracking
- **EnquiryResponses**: Admin responses to enquiries
- **Products**: Product catalog with specifications
- **Notifications**: System notifications for admin
- **EmailLogs**: Email sending history and tracking
- **Users**: Admin users with role-based access

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Joi schemas for all API inputs
- **Rate Limiting**: Protection against abuse
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 📧 Email Integration

The API integrates with SendGrid for automated email services:

- **Enquiry Confirmations**: Automatic emails to customers
- **Admin Notifications**: Email alerts for new enquiries
- **Response Emails**: Automated responses to customer enquiries
- **Email Logging**: Complete tracking of all email activities

## 🎯 Usage Examples

### Creating an Enquiry

```bash
curl -X POST http://localhost:3000/api/v1/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Smith",
    "email": "john@example.com",
    "phone": "+250 788 123 456",
    "product": "Solar Panel Kit 400W",
    "subject": "Product Inquiry",
    "message": "I am interested in your solar panel kit...",
    "location": "Kigali, Rwanda"
  }'
```

### Admin Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greenbeam.com",
    "password": "admin123"
  }'
```

### Getting Dashboard Stats

```bash
curl -X GET http://localhost:3000/api/v1/dashboard/stats \
  -H "Authorization: Bearer <your-token>"
```

## 🧪 Testing

The API includes comprehensive error handling and validation. Test the endpoints using tools like:

- **Postman**: For API testing and documentation
- **curl**: For command-line testing
- **Thunder Client**: VS Code extension for API testing

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SENDGRID_API_KEY` | SendGrid API key | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3000 |

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SendGrid API key
4. Configure CORS origins
5. Set secure JWT secret
6. Enable rate limiting

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete enquiry management system
- Product catalog with categories
- Email integration with SendGrid
- Admin dashboard with analytics
- JWT authentication system
- Comprehensive API documentation

---

**Greenbeam API** - Powering the future of green energy commerce 🌱⚡ 