# Greenbeam Backend API Documentation

This document provides comprehensive documentation for the Greenbeam backend APIs. All endpoints are prefixed with `/api/v1` and return JSON responses.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication APIs
Base URL: `/api/v1/auth`

#### User Login
- **POST** `/login`
- **Description**: Authenticate a user and return access token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "email": "string",
        "name": "string",
        "role": "string"
      },
      "token": "string",
      "refreshToken": "string"
    }
  }
  ```

#### User Registration
- **POST** `/register`
- **Description**: Create a new user account
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "email": "string",
        "name": "string",
        "role": "string"
      },
      "token": "string",
      "refreshToken": "string"
    }
  }
  ```

#### Get User Profile
- **GET** `/profile`
- **Description**: Get the current user's profile information
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "string"
    }
  }
  ```

#### Change Password
- **POST** `/change-password`
- **Description**: Change the current user's password
- **Headers**: Authorization required
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Password changed successfully"
    }
  }
  ```

#### Refresh Token
- **POST** `/refresh`
- **Description**: Refresh the authentication token
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "string",
      "refreshToken": "string"
    }
  }
  ```

#### Logout
- **POST** `/logout`
- **Description**: Log out the current user (client-side token removal)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Logged out successfully"
    }
  }
  ```

### Enquiries APIs
Base URL: `/api/v1/enquiries`

#### Create Enquiry (Public)
- **POST** `/`
- **Description**: Create a new enquiry (no authentication required)
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "subject": "string",
    "message": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "email": "string",
      "subject": "string",
      "message": "string",
      "status": "string",
      "createdAt": "date"
    }
  }
  ```

#### Get All Enquiries
- **GET** `/`
- **Description**: Get all enquiries (admin only)
- **Headers**: Authorization required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `status`: Filter by status
  - `search`: Search term
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "enquiries": [...],
      "pagination": {
        "page": "number",
        "limit": "number",
        "total": "number",
        "pages": "number"
      }
    }
  }
  ```

#### Get Enquiry by ID
- **GET** `/:id`
- **Description**: Get a specific enquiry by ID (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "email": "string",
      "subject": "string",
      "message": "string",
      "status": "string",
      "responses": [...],
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```

#### Update Enquiry Status
- **PATCH** `/:id/status`
- **Description**: Update enquiry status (admin only)
- **Headers**: Authorization required
- **Request Body**:
  ```json
  {
    "status": "string" // 'pending', 'in-progress', 'resolved', 'closed'
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "status": "string",
      "message": "Enquiry status updated successfully"
    }
  }
  ```

#### Respond to Enquiry
- **POST** `/:id/respond`
- **Description**: Respond to an enquiry (admin only)
- **Headers**: Authorization required
- **Request Body**:
  ```json
  {
    "message": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "response": {
        "id": "string",
        "message": "string",
        "createdAt": "date"
      }
    }
  }
  ```

#### Delete Enquiry
- **DELETE** `/:id`
- **Description**: Delete an enquiry (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Enquiry deleted successfully"
    }
  }
  ```

### Products APIs
Base URL: `/api/v1/products`

#### Get All Products
- **GET** `/`
- **Description**: Get all products (public, optional authentication)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `category`: Filter by category
  - `search`: Search term
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `sortBy`: Sort field
  - `sortOrder`: Sort order (asc/desc)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "products": [...],
      "pagination": {
        "page": "number",
        "limit": "number",
        "total": "number",
        "pages": "number"
      }
    }
  }
  ```

#### Get Product by ID
- **GET** `/:id`
- **Description**: Get a specific product by ID (public)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "image": "string",
      "images": [...],
      "rating": "number",
      "createdAt": "date"
    }
  }
  ```

#### Create Product
- **POST** `/`
- **Description**: Create a new product (admin only)
- **Headers**: Authorization required
- **Request Body**: Multipart form data with:
  - `name`: string
  - `description`: string
  - `price`: number
  - `category`: string
  - `image`: file (main image)
  - `images`: files (additional images)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "image": "string",
      "images": [...],
      "createdAt": "date"
    }
  }
  ```

#### Update Product
- **PUT** `/:id`
- **Description**: Update a product (admin only)
- **Headers**: Authorization required
- **Request Body**: Multipart form data with:
  - `name`: string
  - `description`: string
  - `price`: number
  - `category`: string
  - `image`: file (main image, optional)
  - `images`: files (additional images, optional)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "image": "string",
      "images": [...],
      "updatedAt": "date"
    }
  }
  ```

#### Delete Product
- **DELETE** `/:id`
- **Description**: Delete a product (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Product deleted successfully"
    }
  }
  ```

#### Get Product Categories
- **GET** `/categories/all`
- **Description**: Get all product categories (public)
- **Response**:
  ```json
  {
    "success": true,
    "data": [...]
  }
  ```

#### Rate Product
- **POST** `/:id/rate`
- **Description**: Rate a product (public, optional authentication)
- **Request Body**:
  ```json
  {
    "rating": "number" // 1-5
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Rating submitted successfully",
      "newRating": "number"
    }
  }
  ```

### Dashboard APIs
Base URL: `/api/v1/dashboard`

#### Get Dashboard Statistics
- **GET** `/stats`
- **Description**: Get dashboard statistics (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalEnquiries": "number",
      "pendingEnquiries": "number",
      "totalProducts": "number",
      "totalUsers": "number"
    }
  }
  ```

#### Get Chart Data
- **GET** `/charts`
- **Description**: Get chart data for analytics (admin only)
- **Headers**: Authorization required
- **Query Parameters**:
  - `period`: Number of days (default: 30)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "enquiries": [...],
      "products": [...]
    }
  }
  ```

#### Get Recent Activity
- **GET** `/activity`
- **Description**: Get recent activity (admin only)
- **Headers**: Authorization required
- **Query Parameters**:
  - `limit`: Number of activities to return (default: 20)
- **Response**:
  ```json
  {
    "success": true,
    "data": [...]
  }
  ```

### Settings APIs
Base URL: `/api/v1/settings`

#### Get All Settings
- **GET** `/`
- **Description**: Get all settings (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {...}
  }
  ```

#### Get Settings by Category
- **GET** `/:category`
- **Description**: Get settings by category (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {...}
  }
  ```

#### Update Settings by Category
- **PUT** `/:category`
- **Description**: Update settings by category (admin only)
- **Headers**: Authorization required
- **Request Body**: Settings data object
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Settings updated successfully"
    }
  }
  ```

#### Update Single Setting
- **PUT** `/:category/:key`
- **Description**: Update a single setting (admin only)
- **Headers**: Authorization required
- **Request Body**:
  ```json
  {
    "value": "any"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Setting updated successfully"
    }
  }
  ```

#### Delete Single Setting
- **DELETE** `/:category/:key`
- **Description**: Delete a single setting (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Setting deleted successfully"
    }
  }
  ```

### Upload/File APIs
Base URL: `/api/v1/upload`

#### Upload Single File
- **POST** `/single`
- **Description**: Upload a single file (admin only)
- **Headers**: Authorization required
- **Request Body**: Multipart form data with:
  - `file`: file
  - `type`: string (optional)
  - `folder`: string (optional)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "filename": "string",
      "url": "string",
      "type": "string",
      "folder": "string"
    }
  }
  ```

#### Upload Multiple Files
- **POST** `/multiple`
- **Description**: Upload multiple files (admin only)
- **Headers**: Authorization required
- **Request Body**: Multipart form data with:
  - `files`: files (array)
  - `type`: string (optional)
  - `folder`: string (optional)
- **Response**:
  ```json
  {
    "success": true,
    "data": [...]
  }
  ```

#### Upload Files with Specific Fields
- **POST** `/fields`
- **Description**: Upload files with specific field names (admin only)
- **Headers**: Authorization required
- **Request Body**: Multipart form data with:
  - `logo`: file
  - `favicon`: file
  - `heroImage`: file
  - `gallery`: files (array)
  - `documents`: files (array)
- **Response**:
  ```json
  {
    "success": true,
    "data": {...}
  }
  ```

#### Get File by ID
- **GET** `/:id`
- **Description**: Get file information by ID (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "filename": "string",
      "url": "string",
      "type": "string",
      "folder": "string",
      "uploadedBy": "string",
      "createdAt": "date"
    }
  }
  ```

#### Get Files
- **GET** `/`
- **Description**: Get files with filters (admin only)
- **Headers**: Authorization required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `type`: Filter by type
  - `folder`: Filter by folder
  - `search`: Search term
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "files": [...],
      "pagination": {
        "page": "number",
        "limit": "number",
        "total": "number",
        "pages": "number"
      }
    }
  }
  ```

#### Delete File
- **DELETE** `/:id`
- **Description**: Delete a file (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "File deleted successfully"
    }
  }
  ```

#### Update File Metadata
- **PUT** `/:id`
- **Description**: Update file metadata (admin only)
- **Headers**: Authorization required
- **Request Body**:
  ```json
  {
    "type": "string",
    "folder": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "filename": "string",
      "url": "string",
      "type": "string",
      "folder": "string",
      "updatedAt": "date"
    }
  }
  ```

#### Get File Statistics
- **GET** `/stats/overview`
- **Description**: Get file statistics (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalFiles": "number",
      "totalSize": "number",
      "byType": {...},
      "byFolder": {...}
    }
  }
  ```

### Notifications APIs
Base URL: `/api/v1/notifications`

#### Get Notifications
- **GET** `/`
- **Description**: Get notifications (admin only)
- **Headers**: Authorization required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `read`: Filter by read status
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "notifications": [...],
      "pagination": {
        "page": "number",
        "limit": "number",
        "total": "number",
        "pages": "number"
      }
    }
  }
  ```

#### Mark Notification as Read
- **PATCH** `/:id/read`
- **Description**: Mark a notification as read (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "read": true,
      "message": "Notification marked as read"
    }
  }
  ```

#### Mark All Notifications as Read
- **PATCH** `/read-all`
- **Description**: Mark all notifications as read (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "All notifications marked as read"
    }
  }
  ```

#### Delete Notification
- **DELETE** `/:id`
- **Description**: Delete a notification (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Notification deleted successfully"
    }
  }
  ```

#### Get Notification Statistics
- **GET** `/stats`
- **Description**: Get notification statistics (admin only)
- **Headers**: Authorization required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "total": "number",
      "unread": "number",
      "byType": {...}
    }
  }
  ```

#### Create Notification
- **POST** `/`
- **Description**: Create a notification (internal use, admin only)
- **Headers**: Authorization required
- **Request Body**:
  ```json
  {
    "type": "string",
    "title": "string",
    "message": "string",
    "userId": "string" // optional
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "type": "string",
      "title": "string",
      "message": "string",
      "read": false,
      "createdAt": "date"
    }
  }
  ```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Request data validation failed
- `INVALID_CREDENTIALS`: Invalid email or password
- `USER_EXISTS`: User with this email already exists
- `NO_TOKEN`: Access token is required
- `INVALID_TOKEN`: Invalid authentication token
- `TOKEN_EXPIRED`: Authentication token has expired
- `USER_NOT_FOUND`: User not found
- `ENQUIRY_NOT_FOUND`: Enquiry not found
- `PRODUCT_NOT_FOUND`: Product not found
- `NOTIFICATION_NOT_FOUND`: Notification not found
- `FILE_NOT_FOUND`: File not found
- `INTERNAL_SERVER_ERROR`: Unexpected server error