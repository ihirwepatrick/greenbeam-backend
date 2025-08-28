# Order System API Documentation

## Overview
The Order System provides comprehensive e-commerce functionality including cart management, order processing, and payment handling. This system allows users to add products to cart, create orders, and process payments.

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
https://your-domain.com/api/v1
```

---

## Cart Management

### Add Item to Cart
**POST** `/cart/add`

Add a product to the user's shopping cart.

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cart-item-id",
    "productId": 1,
    "quantity": 2,
    "product": {
      "id": 1,
      "name": "Product Name",
      "price": "99.99",
      "image": "image-url",
      "category": "Category"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Item added to cart successfully"
}
```

### Get User's Cart
**GET** `/cart`

Retrieve all items in the user's cart.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart-item-id",
        "productId": 1,
        "quantity": 2,
        "product": {
          "id": 1,
          "name": "Product Name",
          "price": "99.99",
          "image": "image-url",
          "category": "Category",
          "description": "Product description"
        },
        "itemTotal": 199.98,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 199.98,
    "itemCount": 1
  }
}
```

### Update Cart Item Quantity
**PUT** `/cart/update/:productId`

Update the quantity of a specific item in the cart.

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cart-item-id",
    "productId": 1,
    "quantity": 3,
    "product": {
      "id": 1,
      "name": "Product Name",
      "price": "99.99",
      "image": "image-url",
      "category": "Category"
    },
    "itemTotal": 299.97,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Cart item updated successfully"
}
```

### Remove Item from Cart
**DELETE** `/cart/remove/:productId`

Remove a specific item from the cart.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Item removed from cart"
  },
  "message": "Item removed from cart successfully"
}
```

### Clear Cart
**DELETE** `/cart/clear`

Remove all items from the user's cart.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Cart cleared successfully"
  },
  "message": "Cart cleared successfully"
}
```

### Get Cart Item Count
**GET** `/cart/count`

Get the total number of items in the user's cart.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Check if Product is in Cart
**GET** `/cart/check/:productId`

Check if a specific product is in the user's cart.

**Response:**
```json
{
  "success": true,
  "data": {
    "isInCart": true
  }
}
```

---

## Admin Cart Management

### Get All Carts (Admin)
**GET** `/cart/admin/all`

Get all cart items in the system (admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by user name, email, or product name

**Response:**
```json
{
  "success": true,
  "data": {
    "carts": [
      {
        "id": "cart-item-id",
        "userId": "user-id",
        "productId": 1,
        "quantity": 2,
        "user": {
          "id": "user-id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "product": {
          "id": 1,
          "name": "Product Name",
          "price": "99.99",
          "image": "image-url",
          "category": "Category"
        },
        "itemTotal": 199.98,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### Get Cart by User ID (Admin)
**GET** `/cart/admin/user/:userId`

Get the complete cart for a specific user (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "id": "cart-item-id",
        "productId": 1,
        "quantity": 2,
        "product": {
          "id": 1,
          "name": "Product Name",
          "price": "99.99",
          "image": "image-url",
          "category": "Category",
          "description": "Product description"
        },
        "itemTotal": 199.98,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 199.98,
    "itemCount": 1
  }
}
```

### Update Cart Item for Any User (Admin)
**PUT** `/cart/admin/user/:userId/product/:productId`

Update the quantity of a cart item for any user (admin only).

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cart-item-id",
    "userId": "user-id",
    "productId": 1,
    "quantity": 3,
    "product": {
      "id": 1,
      "name": "Product Name",
      "price": "99.99",
      "image": "image-url",
      "category": "Category"
    },
    "itemTotal": 299.97,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Cart item updated successfully"
}
```

### Remove Item from Any User's Cart (Admin)
**DELETE** `/cart/admin/user/:userId/product/:productId`

Remove a specific item from any user's cart (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Item removed from cart"
  },
  "message": "Item removed from cart successfully"
}
```

### Clear Any User's Cart (Admin)
**DELETE** `/cart/admin/user/:userId/clear`

Clear all items from any user's cart (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Cart cleared successfully"
  },
  "message": "Cart cleared successfully"
}
```

### Get Cart Statistics (Admin)
**GET** `/cart/admin/stats`

Get comprehensive cart statistics (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCarts": 150,
    "totalItems": 450,
    "totalValue": "44955.00",
    "averageItemsPerCart": 3.0,
    "averageCartValue": "299.70",
    "activeCarts": 50
  }
}
```

---

## Order Management

### Create Order from Cart
**POST** `/orders/create-from-cart`

Create an order using items from the user's cart.

**Request Body:**
```json
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe",
  "notes": "Please deliver after 6 PM"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "orderNumber": "ORD-1704067200000-123",
    "status": "PENDING",
    "totalAmount": "199.98",
    "paymentStatus": "PENDING",
    "items": [
      {
        "id": "order-item-id",
        "productId": 1,
        "quantity": 2,
        "price": "99.99",
        "product": {
          "id": 1,
          "name": "Product Name",
          "image": "image-url",
          "price": "99.99"
        }
      }
    ],
    "shippingAddress": { /* address object */ },
    "billingAddress": { /* address object */ },
    "paymentMethod": "stripe",
    "notes": "Please deliver after 6 PM",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Order created successfully"
}
```

### Create Order with Custom Items
**POST** `/orders/create`

Create an order with specific items (not from cart).

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe",
  "notes": "Please deliver after 6 PM"
}
```

### Get User's Orders
**GET** `/orders/my-orders`

Get all orders for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-id",
        "orderNumber": "ORD-1704067200000-123",
        "status": "PENDING",
        "totalAmount": "199.98",
        "paymentStatus": "PENDING",
        "itemCount": 2,
        "paymentMethod": "stripe",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Get Order by ID
**GET** `/orders/:id`

Get detailed information about a specific order.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "orderNumber": "ORD-1704067200000-123",
    "status": "PENDING",
    "totalAmount": "199.98",
    "paymentStatus": "PENDING",
    "items": [ /* order items */ ],
    "shippingAddress": { /* address object */ },
    "billingAddress": { /* address object */ },
    "paymentMethod": "stripe",
    "notes": "Please deliver after 6 PM",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "payments": [ /* payment records */ ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Order by Order Number
**GET** `/orders/number/:orderNumber`

Get order details using the order number (public endpoint).

### Cancel Order
**POST** `/orders/:id/cancel`

Cancel a specific order.

**Response:**
```json
{
  "success": true,
  "data": { /* order details */ },
  "message": "Order cancelled successfully"
}
```

### Get Order Statistics
**GET** `/orders/stats/my`

Get order statistics for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 10,
    "pendingOrders": 2,
    "completedOrders": 7,
    "totalRevenue": "1999.80"
  }
}
```

---

## Payment Management

### Create Payment
**POST** `/payments/create`

Create a payment record for an order.

**Request Body:**
```json
{
  "orderId": "order-id",
  "amount": "199.98",
  "currency": "USD",
  "paymentMethod": "stripe",
  "metadata": {
    "stripe_payment_method": "pm_1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-id",
    "orderId": "order-id",
    "amount": "199.98",
    "currency": "USD",
    "paymentMethod": "stripe",
    "gateway": "stripe",
    "status": "PENDING",
    "metadata": { /* metadata object */ },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Payment created successfully"
}
```

### Process Stripe Payment
**POST** `/payments/stripe/process`

Process a payment using Stripe (placeholder implementation).

**Request Body:**
```json
{
  "orderId": "order-id",
  "amount": "199.98",
  "currency": "USD",
  "paymentMethod": "pm_1234567890"
}
```

### Get Payment by ID
**GET** `/payments/:id`

Get detailed information about a specific payment.

### Get Payments by Order ID
**GET** `/payments/order/:orderId`

Get all payments for a specific order.

### Get Payment by Transaction ID
**GET** `/payments/transaction/:transactionId`

Get payment details using the transaction ID (public endpoint).

### Stripe Webhook
**POST** `/payments/stripe/webhook`

Webhook endpoint for Stripe payment events (placeholder implementation).

---

## Admin Endpoints

### Get All Orders (Admin)
**GET** `/orders/admin/all`

Get all orders in the system (admin only).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status
- `search` (optional): Search by order number, customer name, or email

### Update Order Status (Admin)
**PUT** `/orders/admin/:id/status`

Update the status of an order (admin only).

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

### Get All Order Statistics (Admin)
**GET** `/orders/admin/stats`

Get order statistics for all orders (admin only).

### Get All Payments (Admin)
**GET** `/payments/admin/all`

Get all payments in the system (admin only).

### Update Payment Status (Admin)
**PUT** `/payments/admin/:id/status`

Update the status of a payment (admin only).

**Request Body:**
```json
{
  "status": "COMPLETED",
  "transactionId": "txn_1234567890"
}
```

### Process Refund (Admin)
**POST** `/payments/admin/:id/refund`

Process a refund for a payment (admin only).

**Request Body:**
```json
{
  "refundAmount": "99.99",
  "reason": "Customer requested refund"
}
```

### Get Payment Statistics (Admin)
**GET** `/payments/admin/stats`

Get payment statistics for all payments (admin only).

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `PRODUCT_NOT_FOUND`: Product does not exist
- `PRODUCT_NOT_AVAILABLE`: Product is not available for purchase
- `ORDER_NOT_FOUND`: Order does not exist
- `PAYMENT_NOT_FOUND`: Payment does not exist
- `CART_EMPTY`: Cart is empty
- `FORBIDDEN`: User does not have permission
- `INTERNAL_SERVER_ERROR`: Server error

---

## Order Status Values

- `PENDING`: Order is pending confirmation
- `CONFIRMED`: Order has been confirmed
- `PROCESSING`: Order is being processed
- `SHIPPED`: Order has been shipped
- `DELIVERED`: Order has been delivered
- `CANCELLED`: Order has been cancelled
- `REFUNDED`: Order has been refunded

## Payment Status Values

- `PENDING`: Payment is pending
- `PROCESSING`: Payment is being processed
- `COMPLETED`: Payment has been completed
- `FAILED`: Payment has failed
- `CANCELLED`: Payment has been cancelled
- `REFUNDED`: Payment has been refunded

---

## Usage Examples

### Complete Order Flow

1. **Add items to cart:**
   ```bash
   POST /api/v1/cart/add
   {
     "productId": 1,
     "quantity": 2
   }
   ```

2. **Create order from cart:**
   ```bash
   POST /api/v1/orders/create-from-cart
   {
     "shippingAddress": { /* address details */ },
     "paymentMethod": "stripe",
     "notes": "Please deliver after 6 PM"
   }
   ```

3. **Process payment:**
   ```bash
   POST /api/v1/payments/stripe/process
   {
     "orderId": "order-id",
     "amount": "199.98",
     "currency": "USD",
     "paymentMethod": "pm_1234567890"
   }
   ```

4. **Check order status:**
   ```bash
   GET /api/v1/orders/order-id
   ```

### Admin Order Management

1. **View all orders:**
   ```bash
   GET /api/v1/orders/admin/all?status=PENDING
   ```

2. **Update order status:**
   ```bash
   PUT /api/v1/orders/admin/order-id/status
   {
     "status": "CONFIRMED"
   }
   ```

3. **Process refund:**
   ```bash
   POST /api/v1/payments/admin/payment-id/refund
   {
     "refundAmount": "99.99",
     "reason": "Customer requested refund"
   }
   ```
