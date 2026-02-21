// Test Script for Greenbeam Backend APIs
// Run with: node test_script.js

const axios = require('axios');

// Configuration
const BASE_URL = 'https://your-domain.com/api/v1'; // Update with your actual domain
const ADMIN_EMAIL = 'admin@greenbeam.com';
const ADMIN_PASSWORD = 'admin123';
const USER_EMAIL = 'user@greenbeam.com';
const USER_PASSWORD = 'user123';

let adminToken = '';
let userToken = '';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

// Test Authentication
async function testAuthentication() {
  console.log('\n=== Testing Authentication ===');
  
  // Admin Login
  const adminLogin = await apiCall('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  if (adminLogin?.success) {
    adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');
  } else {
    console.log('❌ Admin login failed');
    return false;
  }

  // User Login
  const userLogin = await apiCall('POST', '/auth/login', {
    email: USER_EMAIL,
    password: USER_PASSWORD
  });
  
  if (userLogin?.success) {
    userToken = userLogin.data.token;
    console.log('✅ User login successful');
  } else {
    console.log('❌ User login failed');
    return false;
  }

  return true;
}

// Test Product Creation (Admin)
async function testProductCreation() {
  console.log('\n=== Testing Product Creation ===');
  
  const products = [
    {
      name: "Premium Solar Panel 300W",
      category: "Solar Panels",
      description: "High-efficiency monocrystalline solar panel with 300W output",
      price: 299.99,
      image: "https://example.com/solar-panel.jpg",
      features: ["300W Output", "Monocrystalline", "25 Year Warranty"],
      specifications: {
        power: "300W",
        efficiency: "20.5%",
        dimensions: "1956x992x40mm"
      },
      status: "AVAILABLE"
    },
    {
      name: "Lithium Battery 10kWh",
      category: "Battery Storage",
      description: "High-capacity lithium-ion battery for energy storage",
      price: 5999.99,
      image: "https://example.com/battery.jpg",
      features: ["10kWh Capacity", "Lithium-ion", "10 Year Warranty"],
      specifications: {
        capacity: "10kWh",
        voltage: "48V",
        cycles: "6000+"
      },
      status: "AVAILABLE"
    }
  ];

  for (const product of products) {
    const result = await apiCall('POST', '/products', product, adminToken);
    if (result?.success) {
      console.log(`✅ Product created: ${product.name}`);
    } else {
      console.log(`❌ Failed to create product: ${product.name}`);
    }
  }
}

// Test Cart Operations
async function testCartOperations() {
  console.log('\n=== Testing Cart Operations ===');
  
  // Add items to cart
  const cartItems = [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 }
  ];

  for (const item of cartItems) {
    const result = await apiCall('POST', '/cart/add', item, userToken);
    if (result?.success) {
      console.log(`✅ Added to cart: Product ${item.productId}, Quantity ${item.quantity}`);
    } else {
      console.log(`❌ Failed to add to cart: Product ${item.productId}`);
    }
  }

  // Get user's cart
  const cart = await apiCall('GET', '/cart', null, userToken);
  if (cart?.success) {
    console.log(`✅ Cart retrieved: ${cart.data.itemCount} items, Total: $${cart.data.total}`);
  } else {
    console.log('❌ Failed to get cart');
  }

  // Update cart item
  const updateResult = await apiCall('PUT', '/cart/update/1', { quantity: 3 }, userToken);
  if (updateResult?.success) {
    console.log('✅ Cart item updated');
  } else {
    console.log('❌ Failed to update cart item');
  }

  // Get cart count
  const count = await apiCall('GET', '/cart/count', null, userToken);
  if (count?.success) {
    console.log(`✅ Cart count: ${count.data.count}`);
  } else {
    console.log('❌ Failed to get cart count');
  }
}

// Test Order Creation
async function testOrderCreation() {
  console.log('\n=== Testing Order Creation ===');
  
  const orderData = {
    shippingAddress: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
      address: "123 Solar Street",
      city: "San Francisco",
      state: "California",
      zipCode: "94102",
      country: "United States"
    },
    billingAddress: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
      address: "123 Solar Street",
      city: "San Francisco",
      state: "California",
      zipCode: "94102",
      country: "United States"
    },
    paymentMethod: "stripe",
    notes: "Please deliver during business hours"
  };

  const order = await apiCall('POST', '/orders/create-from-cart', orderData, userToken);
  if (order?.success) {
    console.log(`✅ Order created: ${order.data.orderNumber}, Total: $${order.data.totalAmount}`);
    return order.data.id;
  } else {
    console.log('❌ Failed to create order');
    return null;
  }
}

// Test Payment Creation
async function testPaymentCreation(orderId) {
  console.log('\n=== Testing Payment Creation ===');
  
  if (!orderId) {
    console.log('❌ No order ID provided for payment test');
    return null;
  }

  const paymentData = {
    orderId: orderId,
    amount: "13399.94",
    currency: "RWF",
    paymentMethod: "stripe",
    metadata: {
      stripe_payment_method: "pm_1234567890abcdef",
      customer_id: "cus_1234567890"
    }
  };

  const payment = await apiCall('POST', '/payments/create', paymentData, userToken);
  if (payment?.success) {
    console.log(`✅ Payment created: ${payment.data.id}, Amount: $${payment.data.amount}`);
    return payment.data.id;
  } else {
    console.log('❌ Failed to create payment');
    return null;
  }
}

// Test Admin Operations
async function testAdminOperations(orderId, paymentId) {
  console.log('\n=== Testing Admin Operations ===');
  
  // Get all orders
  const orders = await apiCall('GET', '/orders/admin/all', null, adminToken);
  if (orders?.success) {
    console.log(`✅ Admin retrieved orders: ${orders.data.orders.length} orders`);
  } else {
    console.log('❌ Failed to get all orders');
  }

  // Update order status
  if (orderId) {
    const updateOrder = await apiCall('PUT', `/orders/admin/${orderId}/status`, { status: "CONFIRMED" }, adminToken);
    if (updateOrder?.success) {
      console.log('✅ Order status updated to CONFIRMED');
    } else {
      console.log('❌ Failed to update order status');
    }
  }

  // Update payment status
  if (paymentId) {
    const updatePayment = await apiCall('PUT', `/payments/admin/${paymentId}/status`, { 
      status: "COMPLETED", 
      transactionId: "txn_1234567890abcdef" 
    }, adminToken);
    if (updatePayment?.success) {
      console.log('✅ Payment status updated to COMPLETED');
    } else {
      console.log('❌ Failed to update payment status');
    }
  }

  // Get cart statistics
  const cartStats = await apiCall('GET', '/cart/admin/stats', null, adminToken);
  if (cartStats?.success) {
    console.log(`✅ Cart statistics: ${cartStats.data.totalCarts} total carts, $${cartStats.data.totalValue} total value`);
  } else {
    console.log('❌ Failed to get cart statistics');
  }
}

// Test User Order Retrieval
async function testUserOrderRetrieval() {
  console.log('\n=== Testing User Order Retrieval ===');
  
  // Get user's orders
  const userOrders = await apiCall('GET', '/orders/my-orders', null, userToken);
  if (userOrders?.success) {
    console.log(`✅ User orders retrieved: ${userOrders.data.orders.length} orders`);
  } else {
    console.log('❌ Failed to get user orders');
  }

  // Get order statistics
  const orderStats = await apiCall('GET', '/orders/stats/my', null, userToken);
  if (orderStats?.success) {
    console.log(`✅ Order statistics: ${orderStats.data.totalOrders} total orders, $${orderStats.data.totalRevenue} total revenue`);
  } else {
    console.log('❌ Failed to get order statistics');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Greenbeam Backend API Tests');
  console.log('=====================================');

  // Test authentication first
  const authSuccess = await testAuthentication();
  if (!authSuccess) {
    console.log('❌ Authentication failed. Please check your credentials and server.');
    return;
  }

  // Run all tests
  await testProductCreation();
  await testCartOperations();
  const orderId = await testOrderCreation();
  const paymentId = await testPaymentCreation(orderId);
  await testAdminOperations(orderId, paymentId);
  await testUserOrderRetrieval();

  console.log('\n🎉 All tests completed!');
  console.log('=====================================');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  apiCall,
  testAuthentication,
  testCartOperations,
  testOrderCreation,
  testPaymentCreation,
  testAdminOperations
};
