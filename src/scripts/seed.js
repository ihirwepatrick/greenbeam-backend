const prisma = require('../models');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@greenbeam.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@greenbeam.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample products
  const products = [
    {
      name: 'Solar Panel Kit 400W',
      category: 'Solar Panels',
      description: 'High-efficiency solar panel kit perfect for residential installations. Features advanced monocrystalline technology for maximum energy output.',
      image: '/images/solar-panel-400w.jpg',
      features: ['400W output', '25-year warranty', 'Easy installation', 'Weather resistant', 'Smart monitoring'],
      specifications: {
        power: '400W',
        efficiency: '21.5%',
        warranty: '25 years',
        dimensions: '1765 x 1048 x 35mm',
        weight: '20.5kg',
        voltage: '24V',
        current: '16.67A'
      },
      status: 'AVAILABLE',
      images: [
        '/images/solar-panel-400w-1.jpg',
        '/images/solar-panel-400w-2.jpg',
        '/images/solar-panel-400w-3.jpg'
      ],
      rating: 4.8,
      reviews: 124
    },
    {
      name: 'Solar Panel Kit 500W',
      category: 'Solar Panels',
      description: 'Advanced solar panel kit with higher efficiency and premium features. Ideal for commercial and large residential installations.',
      image: '/images/solar-panel-500w.jpg',
      features: ['500W output', 'Premium efficiency', 'Smart monitoring', '30-year warranty', 'Anti-reflective coating'],
      specifications: {
        power: '500W',
        efficiency: '22.5%',
        warranty: '30 years',
        dimensions: '1765 x 1048 x 35mm',
        weight: '21.5kg',
        voltage: '24V',
        current: '20.83A'
      },
      status: 'AVAILABLE',
      images: [
        '/images/solar-panel-500w-1.jpg',
        '/images/solar-panel-500w-2.jpg'
      ],
      rating: 4.9,
      reviews: 89
    },
    {
      name: 'Solar Inverter 3000W',
      category: 'Inverters',
      description: 'High-performance solar inverter with advanced grid-tie technology. Features smart monitoring and remote control capabilities.',
      image: '/images/solar-inverter-3000w.jpg',
      features: ['3000W capacity', 'Grid-tie technology', 'Smart monitoring', 'Remote control', 'High efficiency'],
      specifications: {
        power: '3000W',
        efficiency: '96.5%',
        warranty: '10 years',
        dimensions: '400 x 300 x 150mm',
        weight: '8.5kg',
        input_voltage: '24V/48V',
        output_voltage: '230V AC'
      },
      status: 'AVAILABLE',
      images: [
        '/images/solar-inverter-3000w-1.jpg',
        '/images/solar-inverter-3000w-2.jpg'
      ],
      rating: 4.7,
      reviews: 67
    },
    {
      name: 'Battery Storage System 10kWh',
      category: 'Battery Storage',
      description: 'Advanced lithium-ion battery storage system for solar energy. Provides reliable backup power and energy independence.',
      image: '/images/battery-storage-10kwh.jpg',
      features: ['10kWh capacity', 'Lithium-ion technology', 'Long cycle life', 'Smart BMS', 'Expandable'],
      specifications: {
        capacity: '10kWh',
        voltage: '48V',
        cycle_life: '6000 cycles',
        warranty: '10 years',
        dimensions: '600 x 400 x 200mm',
        weight: '95kg',
        chemistry: 'LiFePO4'
      },
      status: 'AVAILABLE',
      images: [
        '/images/battery-storage-10kwh-1.jpg',
        '/images/battery-storage-10kwh-2.jpg'
      ],
      rating: 4.6,
      reviews: 45
    },
    {
      name: 'Solar Water Heater 200L',
      category: 'Solar Water Heaters',
      description: 'Efficient solar water heating system for residential use. Reduces energy bills and provides hot water throughout the year.',
      image: '/images/solar-water-heater-200l.jpg',
      features: ['200L capacity', 'Thermal efficiency', 'Anti-freeze protection', 'Easy installation', 'Low maintenance'],
      specifications: {
        capacity: '200L',
        efficiency: '75%',
        warranty: '5 years',
        dimensions: '1200 x 800 x 120mm',
        weight: '45kg',
        max_temperature: '85°C'
      },
      status: 'AVAILABLE',
      images: [
        '/images/solar-water-heater-200l-1.jpg',
        '/images/solar-water-heater-200l-2.jpg'
      ],
      rating: 4.5,
      reviews: 78
    },
    {
      name: 'LED Solar Street Light',
      category: 'Solar Lighting',
      description: 'Smart solar-powered LED street light with motion sensors and automatic operation. Perfect for outdoor lighting solutions.',
      image: '/images/led-solar-street-light.jpg',
      features: ['Motion sensors', 'Automatic operation', 'Weather resistant', 'Long battery life', 'Easy installation'],
      specifications: {
        power: '60W',
        battery: '12V 100Ah',
        runtime: '12 hours',
        warranty: '3 years',
        dimensions: '2000 x 300 x 300mm',
        weight: '25kg',
        light_output: '6000 lumens'
      },
      status: 'AVAILABLE',
      images: [
        '/images/led-solar-street-light-1.jpg',
        '/images/led-solar-street-light-2.jpg'
      ],
      rating: 4.4,
      reviews: 92
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product
    });
  }

  console.log('✅ Sample products created');

  // Create sample enquiries
  const enquiries = [
    {
      customerName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+250 788 123 456',
      product: 'Solar Panel Kit 400W',
      subject: 'Product Availability Inquiry',
      message: 'Hi, I\'m interested in the Solar Panel Kit 400W. I would like to know if it\'s available and what the installation process involves. Also, could you provide information about warranty and maintenance requirements?',
      source: 'Website Form',
      location: 'Kigali, Rwanda',
      priority: 'HIGH'
    },
    {
      customerName: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+250 789 234 567',
      product: 'Solar Inverter 3000W',
      subject: 'Technical Specifications Request',
      message: 'I need detailed technical specifications for the Solar Inverter 3000W. Specifically, I want to know about compatibility with my existing solar panel setup and grid requirements.',
      source: 'Website Form',
      location: 'Nairobi, Kenya',
      priority: 'MEDIUM'
    },
    {
      customerName: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+250 787 345 678',
      product: 'Battery Storage System 10kWh',
      subject: 'Commercial Installation Quote',
      message: 'We are looking to install a battery storage system for our commercial building. Can you provide a quote for the 10kWh system including installation and any additional components needed?',
      source: 'Website Form',
      location: 'Dar es Salaam, Tanzania',
      priority: 'HIGH'
    }
  ];

  for (const enquiry of enquiries) {
    await prisma.enquiry.create({
      data: enquiry
    });
  }

  console.log('✅ Sample enquiries created');

  // Create sample notifications
  const notifications = [
    {
      type: 'SYSTEM',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will be performed on Sunday at 2:00 AM. The system will be unavailable for approximately 30 minutes.',
      priority: 'MEDIUM',
      data: {
        maintenance_time: '2024-01-21T02:00:00Z',
        duration: '30 minutes'
      }
    },
    {
      type: 'ALERT',
      title: 'High Enquiry Volume',
      message: 'You have received 5 new enquiries in the last hour. Please review and respond promptly.',
      priority: 'HIGH',
      data: {
        enquiry_count: 5,
        time_period: '1 hour'
      }
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification
    });
  }

  console.log('✅ Sample notifications created');

  // Create sample email logs
  const emailLogs = [
    {
      toEmail: 'john.smith@email.com',
      subject: 'Enquiry Received - Greenbeam',
      body: 'Thank you for your enquiry regarding Solar Panel Kit 400W...',
      type: 'enquiry_confirmation',
      status: 'SENT',
      sentAt: new Date()
    },
    {
      toEmail: 'admin@greenbeam.com',
      subject: 'New Product Enquiry',
      body: 'John Smith submitted an enquiry for Solar Panel Kit 400W...',
      type: 'admin_notification',
      status: 'SENT',
      sentAt: new Date()
    }
  ];

  for (const emailLog of emailLogs) {
    await prisma.emailLog.create({
      data: emailLog
    });
  }

  console.log('✅ Sample email logs created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log(`   - Admin user: ${adminUser.email}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Enquiries: ${enquiries.length}`);
  console.log(`   - Notifications: ${notifications.length}`);
  console.log(`   - Email logs: ${emailLogs.length}`);
  console.log('');
  console.log('🔑 Default admin credentials:');
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 