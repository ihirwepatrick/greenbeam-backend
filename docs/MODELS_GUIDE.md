# Greenbeam API Models Guide

This guide explains how to use the new model system in the Greenbeam e-commerce API for better structure, validation, and maintainability.

## Table of Contents

1. [Overview](#overview)
2. [Model Types](#model-types)
3. [ResponseModel](#responsemodel)
4. [DTOModel](#dtomodel)
5. [ServiceModel](#servicemodel)
6. [ValidationModel](#validationmodel)
7. [Middleware Integration](#middleware-integration)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)

## Overview

The new model system provides a structured approach to handling API requests, responses, validation, and business logic. It consists of four main components:

- **ResponseModel**: Standardized API response formatting
- **DTOModel**: Data Transfer Objects for request/response handling
- **ServiceModel**: Business logic layer
- **ValidationModel**: Comprehensive validation schemas

## Model Types

### 1. ResponseModel

The `ResponseModel` ensures consistent API responses across all endpoints.

#### Features:
- Standardized success/error response format
- Pagination support
- Validation error formatting
- HTTP status code handling

#### Usage:

```javascript
const { ResponseModel } = require('../models');

// Success response
const successResponse = ResponseModel.success(data, 'Operation completed', 200);

// Error response
const errorResponse = ResponseModel.error('Something went wrong', 'ERROR_CODE', 500);

// Paginated response
const paginatedResponse = ResponseModel.paginated(data, page, limit, total, 'Data retrieved');

// Validation error
const validationError = ResponseModel.validationError(errors, 'Validation failed');

// Not found
const notFound = ResponseModel.notFound('User', 'user-id-123');

// Unauthorized
const unauthorized = ResponseModel.unauthorized('Invalid token');
```

### 2. DTOModel

Data Transfer Objects handle data transformation between API layer and database.

#### Available DTOs:
- `EnquiryDTO`
- `EnquiryResponseDTO`
- `ProductDTO`
- `UserDTO`
- `NotificationDTO`
- `EmailLogDTO`

#### Usage:

```javascript
const { EnquiryDTO } = require('../models');

// Convert request data to database format
const enquiryData = EnquiryDTO.fromRequest(req.body);

// Convert database result to API response
const responseData = EnquiryDTO.toResponse(enquiry);

// Convert list of items
const responseList = EnquiryDTO.toResponseList(enquiries);
```

### 3. ServiceModel

Service models contain business logic and provide a clean interface for controllers.

#### Available Services:
- `EnquiryService`
- `ProductService`
- `NotificationService`
- `DashboardService`

#### Usage:

```javascript
const { EnquiryService } = require('../models');

// Create enquiry with business logic
const result = await EnquiryService.createEnquiry(data);

// Get enquiries with pagination and filtering
const enquiries = await EnquiryService.getEnquiries({
  page: 1,
  limit: 10,
  status: 'NEW',
  search: 'solar panel'
});

// Get specific enquiry
const enquiry = await EnquiryService.getEnquiryById(id);

// Update enquiry status
const updated = await EnquiryService.updateEnquiryStatus(id, 'RESPONDED');
```

### 4. ValidationModel

Comprehensive validation schemas with detailed error messages.

#### Available Validation Types:
- `enquiry` (create, updateStatus, respond)
- `product` (create, update)
- `user` (register, login)
- `notification` (create)
- `email` (send)
- `query` (pagination)

#### Usage:

```javascript
const { ValidationModel } = require('../models');

// Validate enquiry data
const validation = ValidationModel.validateEnquiry(data, 'create');
if (!validation.isValid) {
  return res.status(400).json(validation.formattedResponse);
}

// Validate product data
const productValidation = ValidationModel.validateProduct(data, 'update');

// Validate query parameters
const queryValidation = ValidationModel.validateQuery(req.query);

// Validate ID parameter
const idValidation = ValidationModel.validateId(req.params.id, 'string');
```

## Middleware Integration

The model system includes middleware for seamless integration:

### Available Middleware:

```javascript
const {
  validateRequest,
  validateId,
  formatResponse,
  errorHandler,
  requestLogger,
  authenticateToken,
  authorizeRoles
} = require('../middleware/modelMiddleware');
```

### Usage in Routes:

```javascript
const router = express.Router();

// Apply global middleware
router.use(formatResponse());
router.use(errorHandler());
router.use(requestLogger());

// Validate request body
router.post('/enquiries',
  validateRequest('enquiry', 'create'),
  EnquiryController.createEnquiry
);

// Validate ID parameter
router.get('/enquiries/:id',
  validateId('string'),
  EnquiryController.getEnquiryById
);

// Authentication and authorization
router.use(authenticateToken());
router.get('/admin/stats',
  authorizeRoles('ADMIN'),
  DashboardController.getStats
);
```

## Usage Examples

### Complete Controller Example:

```javascript
const { 
  EnquiryService, 
  ResponseModel, 
  ValidationModel 
} = require('../models');

class EnquiryController {
  static async createEnquiry(req, res) {
    try {
      // Validation handled by middleware
      const enquiryData = req.validatedData;

      // Use service layer
      const result = await EnquiryService.createEnquiry(enquiryData);

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create enquiry error:', error);
      return res.status(500).json(
        ResponseModel.error('Failed to create enquiry', 'ENQUIRY_CREATION_ERROR', 500)
      );
    }
  }

  static async getEnquiries(req, res) {
    try {
      const queryOptions = req.validatedData || {};
      const result = await EnquiryService.getEnquiries(queryOptions);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(
        ResponseModel.error('Failed to retrieve enquiries', 'ENQUIRY_RETRIEVAL_ERROR', 500)
      );
    }
  }
}
```

### Route Configuration:

```javascript
const router = express.Router();

// Public routes
router.post('/enquiries',
  validateRequest('enquiry', 'create'),
  EnquiryController.createEnquiry
);

// Protected routes
router.use(authenticateToken());

router.get('/enquiries',
  validateRequest('query', 'pagination'),
  EnquiryController.getEnquiries
);

router.get('/enquiries/:id',
  validateId('string'),
  EnquiryController.getEnquiryById
);

router.patch('/enquiries/:id/status',
  validateId('string'),
  validateRequest('enquiry', 'updateStatus'),
  authorizeRoles('ADMIN'),
  EnquiryController.updateStatus
);
```

## Best Practices

### 1. Always Use Service Layer

```javascript
// ✅ Good
const result = await EnquiryService.createEnquiry(data);

// ❌ Avoid
const enquiry = await prisma.enquiry.create({ data });
```

### 2. Use DTOs for Data Transformation

```javascript
// ✅ Good
const enquiryData = EnquiryDTO.fromRequest(req.body);
const response = EnquiryDTO.toResponse(enquiry);

// ❌ Avoid
const enquiry = await prisma.enquiry.create({ data: req.body });
```

### 3. Consistent Error Handling

```javascript
// ✅ Good
return res.status(500).json(
  ResponseModel.error('Failed to create enquiry', 'ENQUIRY_CREATION_ERROR', 500)
);

// ❌ Avoid
return res.status(500).json({ error: 'Something went wrong' });
```

### 4. Use Middleware for Validation

```javascript
// ✅ Good
router.post('/enquiries',
  validateRequest('enquiry', 'create'),
  EnquiryController.createEnquiry
);

// ❌ Avoid
router.post('/enquiries', (req, res) => {
  // Manual validation in controller
});
```

### 5. Proper Response Formatting

```javascript
// ✅ Good
return res.status(200).json(
  ResponseModel.success(data, 'Enquiries retrieved successfully')
);

// ❌ Avoid
return res.status(200).json(data);
```

## Benefits

1. **Consistency**: All API responses follow the same format
2. **Maintainability**: Business logic is separated from controllers
3. **Validation**: Comprehensive validation with detailed error messages
4. **Type Safety**: Structured data transformation with DTOs
5. **Reusability**: Services can be used across different controllers
6. **Error Handling**: Centralized error handling and formatting
7. **Documentation**: Self-documenting code with clear structure

## Migration Guide

To migrate existing controllers to use the new model system:

1. **Replace direct Prisma calls with Service calls**
2. **Add validation middleware to routes**
3. **Use DTOs for data transformation**
4. **Update response formatting to use ResponseModel**
5. **Add proper error handling**

Example migration:

```javascript
// Before
router.post('/enquiries', async (req, res) => {
  try {
    const enquiry = await prisma.enquiry.create({ data: req.body });
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// After
router.post('/enquiries',
  validateRequest('enquiry', 'create'),
  async (req, res) => {
    try {
      const result = await EnquiryService.createEnquiry(req.validatedData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json(
        ResponseModel.error('Failed to create enquiry', 'ENQUIRY_CREATION_ERROR', 500)
      );
    }
  }
);
```

This model system provides a robust foundation for building scalable and maintainable APIs. 