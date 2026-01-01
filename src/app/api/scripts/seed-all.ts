import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  let connection;
  
  try {
    // Create MySQL connection
    console.log('🔌 Connecting to MySQL database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'agrimarket',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    
    console.log('✅ Connected to MySQL database\n');

    // Truncate all tables in reverse dependency order
    console.log('🗑️  Clearing existing data...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'abandoned_processes',
      'activity_logs',
      'notifications',
      'transactions',
      'proof_of_delivery',
      'delivery_tasks',
      'order_items',
      'orders',
      'products',
      'users'
    ];
    
    for (const table of tables) {
      await connection.execute(`TRUNCATE TABLE ${table}`);
    }
    
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ All tables cleared\n');

    // Seed Users
    console.log('👥 Seeding users...');
    const userInserts = [
      // Admins
      `INSERT INTO users (role, phone_number, pin, email, full_name, gender, date_of_birth, address, location, education, created_at, updated_at) 
       VALUES ('admin', '+2348012345678', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'admin@agrimarket.ng', 'Chukwuemeka Okafor', 'male', '1985-03-15', '12 Marina Street, Lagos Island', 'Lagos', 'University', NOW(), NOW())`,
      
      `INSERT INTO users (role, phone_number, pin, email, full_name, gender, date_of_birth, address, location, education, created_at, updated_at) 
       VALUES ('admin', '+2348023456789', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'admin2@agrimarket.ng', 'Ngozi Adebayo', 'female', '1988-07-22', '45 Awolowo Road, Ikoyi', 'Lagos', 'University', NOW(), NOW())`,
      
      // Sellers
      `INSERT INTO users (role, phone_number, pin, email, full_name, middle_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, education, nin, bvn, marital_status, created_at, updated_at) 
       VALUES ('seller', '+2348034567890', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'seller1@agrimarket.ng', 'Adekunle', 'Babatunde', 'male', '1980-05-10', '78 Ibadan Road, Ikeja', 'Lagos', '0123456789', 'Adekunle Babatunde', 'GTBank', 'Secondary', '12345678901', '22334455667', 'married', NOW(), NOW())`,
      
      `INSERT INTO users (role, phone_number, pin, email, full_name, middle_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, education, nin, bvn, marital_status, created_at, updated_at) 
       VALUES ('seller', '+2348045678901', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'seller2@agrimarket.ng', 'Fatima', 'Abubakar', 'female', '1992-11-25', '23 Ahmadu Bello Way, Kaduna', 'Kaduna', '9876543210', 'Fatima Abubakar', 'Zenith Bank', 'University', '98765432109', '77665544332', 'single', NOW(), NOW())`,
      
      `INSERT INTO users (role, phone_number, pin, email, full_name, middle_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, education, nin, bvn, marital_status, created_at, updated_at) 
       VALUES ('seller', '+2348056789012', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'seller3@agrimarket.ng', 'Emeka', 'Nnamdi', 'male', '1987-09-18', '56 Old Aba Road, Port Harcourt', 'Rivers', '5647382910', 'Emeka Nnamdi', 'First Bank', 'Secondary', '55667788990', '11223344556', 'married', NOW(), NOW())`,
      
      // Buyers
      `INSERT INTO users (role, phone_number, pin, email, full_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, marital_status, created_at, updated_at) 
       VALUES ('buyer', '+2348067890123', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'buyer1@gmail.com', 'Oluwaseun Adeleke', 'male', '1995-02-14', '15 Allen Avenue, Ikeja', 'Lagos', '3456789012', 'Oluwaseun Adeleke', 'Access Bank', 'single', NOW(), NOW())`,
      
      `INSERT INTO users (role, phone_number, pin, email, full_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, marital_status, created_at, updated_at) 
       VALUES ('buyer', '+2348078901234', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'buyer2@gmail.com', 'Chioma Okeke', 'female', '1990-08-30', '89 Nnebisi Road, Asaba', 'Delta', '7890123456', 'Chioma Okeke', 'UBA', 'married', NOW(), NOW())`,
      
      `INSERT INTO users (role, phone_number, pin, email, full_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, marital_status, created_at, updated_at) 
       VALUES ('buyer', '+2348089012345', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'buyer3@gmail.com', 'Ibrahim Mohammed', 'male', '1993-12-05', '34 Murtala Mohammed Way, Kano', 'Kano', '2345678901', 'Ibrahim Mohammed', 'GTBank', 'single', NOW(), NOW())`,
      
      // Drivers
      `INSERT INTO users (role, phone_number, pin, email, full_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, has_vehicle, line_mark, marital_status, created_at, updated_at) 
       VALUES ('driver', '+2348090123456', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'driver1@agrimarket.ng', 'Tunde Oladipo', 'male', '1986-04-20', '67 Oregun Road, Ikeja', 'Lagos', '6789012345', 'Tunde Oladipo', 'Zenith Bank', 1, 'Scar on left cheek', 'married', NOW(), NOW())`,
      
      `INSERT INTO users (role, phone_number, pin, email, full_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, has_vehicle, line_mark, marital_status, created_at, updated_at) 
       VALUES ('driver', '+2348001234567', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM', 'driver2@agrimarket.ng', 'Uche Eze', 'male', '1989-06-12', '23 Enugu Road, Onitsha', 'Anambra', '4567890123', 'Uche Eze', 'First Bank', 1, 'Tribal mark on forehead', 'single', NOW(), NOW())`
    ];

    for (const insert of userInserts) {
      await connection.execute(insert);
    }
    console.log('✅ Users seeded successfully (10 users)\n');

    // Seed Products
    console.log('🌾 Seeding products...');
    const productInserts = [
      // Seller 1 (ID: 3) products
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (3, 'Premium Basmati Rice', 'Rice', 5000, '45000', '225000000', 'available', 1001, 1, '2024-01-15 10:30:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (3, 'Local White Rice', 'Rice', 3000, '38000', '114000000', 'available', 1002, 1, '2024-01-15 11:00:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (3, 'Brown Rice', 'Rice', 2000, '42000', '84000000', 'available', 1003, 2, '2024-01-16 09:15:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, created_at, updated_at) 
       VALUES (3, 'Parboiled Rice', 'Rice', 4000, '40000', '160000000', 'pending', 1004, NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (3, 'Jasmine Rice', 'Rice', 1500, '48000', '72000000', 'available', 1005, 1, '2024-01-17 14:20:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (3, 'Long Grain Rice', 'Rice', 3500, '43000', '150500000', 'available', 1006, 2, '2024-01-18 08:45:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (3, 'Short Grain Rice', 'Rice', 2500, '41000', '102500000', 'available', 1007, 1, '2024-01-19 13:10:00', NOW(), NOW())`,
      
      // Seller 2 (ID: 4) products
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (4, 'White Yam Tubers', 'Yam', 8000, '1500', '12000000', 'available', 2001, 1, '2024-01-20 10:00:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (4, 'Yellow Yam', 'Yam', 6000, '1800', '10800000', 'available', 2002, 2, '2024-01-20 11:30:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (4, 'Fresh Tomatoes', 'Tomato', 10000, '500', '5000000', 'available', 2003, 1, '2024-01-21 07:45:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (4, 'Plum Tomatoes', 'Tomato', 7500, '600', '4500000', 'available', 2004, 2, '2024-01-21 09:20:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, created_at, updated_at) 
       VALUES (4, 'Cherry Tomatoes', 'Tomato', 5000, '800', '4000000', 'pending', 2005, NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (4, 'Brown Beans', 'Beans', 4000, '2500', '10000000', 'available', 2006, 1, '2024-01-22 12:15:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (4, 'White Beans', 'Beans', 3500, '2800', '9800000', 'available', 2007, 2, '2024-01-22 14:00:00', NOW(), NOW())`,
      
      // Seller 3 (ID: 5) products
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (5, 'Honey Beans', 'Beans', 3000, '3000', '9000000', 'available', 3001, 1, '2024-01-23 08:30:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (5, 'Black-eyed Beans', 'Beans', 2500, '2700', '6750000', 'available', 3002, 2, '2024-01-23 10:45:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (5, 'Sweet Potatoes', 'Potato', 5000, '1200', '6000000', 'available', 3003, 1, '2024-01-24 11:20:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (5, 'Irish Potatoes', 'Potato', 4500, '1500', '6750000', 'available', 3004, 2, '2024-01-24 13:00:00', NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, created_at, updated_at) 
       VALUES (5, 'Cassava Tubers', 'Cassava', 8000, '800', '6400000', 'pending', 3005, NOW(), NOW())`,
      
      `INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at, created_at, updated_at) 
       VALUES (5, 'Fresh Plantains', 'Plantain', 6000, '1000', '6000000', 'available', 3006, 1, '2024-01-25 09:40:00', NOW(), NOW())`
    ];

    for (const insert of productInserts) {
      await connection.execute(insert);
    }
    console.log('✅ Products seeded successfully (20 products)\n');

    // Seed Orders
    console.log('📦 Seeding orders...');
    const orderInserts = [
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, buyer_approved, buyer_approved_at, created_at, updated_at) 
       VALUES ('ORD-2024-001', 6, '2250000', '15 Allen Avenue, Ikeja, Lagos', 'completed', 'delivered', 1, '2024-01-28 15:30:00', '2024-01-25 10:00:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, buyer_approved, buyer_approved_at, created_at, updated_at) 
       VALUES ('ORD-2024-002', 7, '1140000', '89 Nnebisi Road, Asaba, Delta', 'completed', 'delivered', 1, '2024-01-29 14:20:00', '2024-01-26 11:30:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, buyer_approved, buyer_approved_at, created_at, updated_at) 
       VALUES ('ORD-2024-003', 8, '840000', '34 Murtala Mohammed Way, Kano, Kano', 'completed', 'delivered', 1, '2024-01-30 16:45:00', '2024-01-27 09:15:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, created_at, updated_at) 
       VALUES ('ORD-2024-004', 6, '1600000', '15 Allen Avenue, Ikeja, Lagos', 'held', 'in_transit', '2024-01-28 13:00:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, created_at, updated_at) 
       VALUES ('ORD-2024-005', 7, '720000', '89 Nnebisi Road, Asaba, Delta', 'held', 'in_transit', '2024-01-29 08:45:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, buyer_approved, buyer_approved_at, created_at, updated_at) 
       VALUES ('ORD-2024-006', 8, '1025000', '34 Murtala Mohammed Way, Kano, Kano', 'completed', 'delivered', 1, '2024-02-01 11:30:00', '2024-01-30 10:20:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, created_at, updated_at) 
       VALUES ('ORD-2024-007', 6, '120000', '15 Allen Avenue, Ikeja, Lagos', 'held', 'processing', '2024-01-31 14:15:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, created_at, updated_at) 
       VALUES ('ORD-2024-008', 7, '108000', '89 Nnebisi Road, Asaba, Delta', 'held', 'processing', '2024-02-01 09:30:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, buyer_approved, buyer_approved_at, created_at, updated_at) 
       VALUES ('ORD-2024-009', 8, '50000', '34 Murtala Mohammed Way, Kano, Kano', 'completed', 'delivered', 1, '2024-02-03 13:45:00', '2024-02-02 11:00:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, created_at, updated_at) 
       VALUES ('ORD-2024-010', 6, '45000', '15 Allen Avenue, Ikeja, Lagos', 'pending', 'placed', '2024-02-03 15:20:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, created_at, updated_at) 
       VALUES ('ORD-2024-011', 7, '40000', '89 Nnebisi Road, Asaba, Delta', 'pending', 'placed', '2024-02-04 10:45:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, buyer_approved, buyer_approved_at, created_at, updated_at) 
       VALUES ('ORD-2024-012', 8, '100000', '34 Murtala Mohammed Way, Kano, Kano', 'completed', 'delivered', 1, '2024-02-05 17:20:00', '2024-02-04 12:30:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, created_at, updated_at) 
       VALUES ('ORD-2024-013', 6, '98000', '15 Allen Avenue, Ikeja, Lagos', 'held', 'in_transit', '2024-02-05 14:00:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, created_at, updated_at) 
       VALUES ('ORD-2024-014', 7, '90000', '89 Nnebisi Road, Asaba, Delta', 'held', 'processing', '2024-02-06 09:15:00', NOW())`,
      
      `INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, escrow_status, order_status, buyer_approved, buyer_approved_at, created_at, updated_at) 
       VALUES ('ORD-2024-015', 8, '60000', '34 Murtala Mohammed Way, Kano, Kano', 'completed', 'delivered', 1, '2024-02-07 16:30:00', '2024-02-06 11:45:00', NOW())`
    ];

    for (const insert of orderInserts) {
      await connection.execute(insert);
    }
    console.log('✅ Orders seeded successfully (15 orders)\n');

    // Seed Order Items
    console.log('📋 Seeding order items...');
    const orderItemInserts = [
      // Order 1 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (1, 1, 50, '45000', '2250000', '2024-01-25 10:00:00')`,
      
      // Order 2 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (2, 2, 30, '38000', '1140000', '2024-01-26 11:30:00')`,
      
      // Order 3 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (3, 3, 20, '42000', '840000', '2024-01-27 09:15:00')`,
      
      // Order 4 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (4, 4, 40, '40000', '1600000', '2024-01-28 13:00:00')`,
      
      // Order 5 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (5, 5, 15, '48000', '720000', '2024-01-29 08:45:00')`,
      
      // Order 6 items (multiple items)
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (6, 6, 20, '43000', '860000', '2024-01-30 10:20:00')`,
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (6, 7, 4, '41000', '164000', '2024-01-30 10:20:00')`,
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (6, 8, 1, '1500', '1000', '2024-01-30 10:20:00')`,
      
      // Order 7 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (7, 8, 80, '1500', '120000', '2024-01-31 14:15:00')`,
      
      // Order 8 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (8, 9, 60, '1800', '108000', '2024-02-01 09:30:00')`,
      
      // Order 9 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (9, 10, 100, '500', '50000', '2024-02-02 11:00:00')`,
      
      // Order 10 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (10, 11, 75, '600', '45000', '2024-02-03 15:20:00')`,
      
      // Order 11 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (11, 12, 50, '800', '40000', '2024-02-04 10:45:00')`,
      
      // Order 12 items (multiple items)
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (12, 13, 30, '2500', '75000', '2024-02-04 12:30:00')`,
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (12, 14, 9, '2800', '25000', '2024-02-04 12:30:00')`,
      
      // Order 13 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (13, 15, 32, '3000', '96000', '2024-02-05 14:00:00')`,
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (13, 16, 1, '2700', '2000', '2024-02-05 14:00:00')`,
      
      // Order 14 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (14, 17, 75, '1200', '90000', '2024-02-06 09:15:00')`,
      
      // Order 15 items
      `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price, created_at) 
       VALUES (15, 18, 40, '1500', '60000', '2024-02-06 11:45:00')`
    ];

    for (const insert of orderItemInserts) {
      await connection.execute(insert);
    }
    console.log('✅ Order items seeded successfully (19 items)\n');

    // Seed Delivery Tasks
    console.log('🚚 Seeding delivery tasks...');
    const deliveryTaskInserts = [
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, pickup_verification_photos, pickup_qr_code, pickup_verified_at, delivery_signature, delivery_photos, delivery_verified_at, created_at, updated_at) 
       VALUES (1, 9, 3, '78 Ibadan Road, Ikeja, Lagos', '15 Allen Avenue, Ikeja, Lagos', 'Adekunle Babatunde', '+2348034567890', 'Oluwaseun Adeleke', '+2348067890123', 'completed', 'https://storage.agrimarket.ng/photos/pickup_001.jpg', 'QR001', '2024-01-26 08:00:00', 'https://storage.agrimarket.ng/signatures/sig_001.png', 'https://storage.agrimarket.ng/photos/delivery_001.jpg', '2024-01-28 15:00:00', '2024-01-25 10:30:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, pickup_verification_photos, pickup_qr_code, pickup_verified_at, delivery_signature, delivery_photos, delivery_verified_at, created_at, updated_at) 
       VALUES (2, 10, 3, '78 Ibadan Road, Ikeja, Lagos', '89 Nnebisi Road, Asaba, Delta', 'Adekunle Babatunde', '+2348034567890', 'Chioma Okeke', '+2348078901234', 'completed', 'https://storage.agrimarket.ng/photos/pickup_002.jpg', 'QR002', '2024-01-27 09:00:00', 'https://storage.agrimarket.ng/signatures/sig_002.png', 'https://storage.agrimarket.ng/photos/delivery_002.jpg', '2024-01-29 14:00:00', '2024-01-26 12:00:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, pickup_verification_photos, pickup_qr_code, pickup_verified_at, delivery_signature, delivery_photos, delivery_verified_at, created_at, updated_at) 
       VALUES (3, 9, 3, '78 Ibadan Road, Ikeja, Lagos', '34 Murtala Mohammed Way, Kano, Kano', 'Adekunle Babatunde', '+2348034567890', 'Ibrahim Mohammed', '+2348089012345', 'completed', 'https://storage.agrimarket.ng/photos/pickup_003.jpg', 'QR003', '2024-01-28 07:30:00', 'https://storage.agrimarket.ng/signatures/sig_003.png', 'https://storage.agrimarket.ng/photos/delivery_003.jpg', '2024-01-30 16:30:00', '2024-01-27 10:00:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, pickup_verification_photos, pickup_qr_code, pickup_verified_at, created_at, updated_at) 
       VALUES (4, 10, 3, '78 Ibadan Road, Ikeja, Lagos', '15 Allen Avenue, Ikeja, Lagos', 'Adekunle Babatunde', '+2348034567890', 'Oluwaseun Adeleke', '+2348067890123', 'in_transit', 'https://storage.agrimarket.ng/photos/pickup_004.jpg', 'QR004', '2024-01-29 08:00:00', '2024-01-28 13:30:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, pickup_verification_photos, pickup_qr_code, pickup_verified_at, created_at, updated_at) 
       VALUES (5, 9, 3, '78 Ibadan Road, Ikeja, Lagos', '89 Nnebisi Road, Asaba, Delta', 'Adekunle Babatunde', '+2348034567890', 'Chioma Okeke', '+2348078901234', 'in_transit', 'https://storage.agrimarket.ng/photos/pickup_005.jpg', 'QR005', '2024-01-30 09:15:00', '2024-01-29 09:00:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, pickup_verification_photos, pickup_qr_code, pickup_verified_at, delivery_signature, delivery_photos, delivery_verified_at, created_at, updated_at) 
       VALUES (6, 10, 3, '78 Ibadan Road, Ikeja, Lagos', '34 Murtala Mohammed Way, Kano, Kano', 'Adekunle Babatunde', '+2348034567890', 'Ibrahim Mohammed', '+2348089012345', 'completed', 'https://storage.agrimarket.ng/photos/pickup_006.jpg', 'QR006', '2024-01-31 08:30:00', 'https://storage.agrimarket.ng/signatures/sig_006.png', 'https://storage.agrimarket.ng/photos/delivery_006.jpg', '2024-02-01 11:15:00', '2024-01-30 10:45:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, created_at, updated_at) 
       VALUES (7, 9, 4, '23 Ahmadu Bello Way, Kaduna, Kaduna', '15 Allen Avenue, Ikeja, Lagos', 'Fatima Abubakar', '+2348045678901', 'Oluwaseun Adeleke', '+2348067890123', 'assigned', '2024-01-31 14:30:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, created_at, updated_at) 
       VALUES (8, 10, 4, '23 Ahmadu Bello Way, Kaduna, Kaduna', '89 Nnebisi Road, Asaba, Delta', 'Fatima Abubakar', '+2348045678901', 'Chioma Okeke', '+2348078901234', 'assigned', '2024-02-01 09:45:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, pickup_verification_photos, pickup_qr_code, pickup_verified_at, delivery_signature, delivery_photos, delivery_verified_at, created_at, updated_at) 
       VALUES (9, 9, 4, '23 Ahmadu Bello Way, Kaduna, Kaduna', '34 Murtala Mohammed Way, Kano, Kano', 'Fatima Abubakar', '+2348045678901', 'Ibrahim Mohammed', '+2348089012345', 'completed', 'https://storage.agrimarket.ng/photos/pickup_009.jpg', 'QR009', '2024-02-03 08:00:00', 'https://storage.agrimarket.ng/signatures/sig_009.png', 'https://storage.agrimarket.ng/photos/delivery_009.jpg', '2024-02-03 13:30:00', '2024-02-02 11:30:00', NOW())`,
      
      `INSERT INTO delivery_tasks (order_id, driver_id, seller_id, pickup_address, delivery_address, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, status, pickup_verification_photos, pickup_qr_code, pickup_verified_at, delivery_signature, delivery_photos, delivery_verified_at, created_at, updated_at) 
       VALUES (12, 10, 5, '56 Old Aba Road, Port Harcourt, Rivers', '34 Murtala Mohammed Way, Kano, Kano', 'Emeka Nnamdi', '+2348056789012', 'Ibrahim Mohammed', '+2348089012345', 'completed', 'https://storage.agrimarket.ng/photos/pickup_012.jpg', 'QR012', '2024-02-05 09:00:00', 'https://storage.agrimarket.ng/signatures/sig_012.png', 'https://storage.agrimarket.ng/photos/delivery_012.jpg', '2024-02-05 17:00:00', '2024-02-04 13:00:00', NOW())`
    ];

    for (const insert of deliveryTaskInserts) {
      await connection.execute(insert);
    }
    console.log('✅ Delivery tasks seeded successfully (10 tasks)\n');

    // Seed Proof of Delivery
    console.log('📸 Seeding proof of delivery...');
    const podInserts = [
      `INSERT INTO proof_of_delivery (delivery_task_id, order_id, buyer_signature, delivery_photos, buyer_confirmation, buyer_feedback, legal_agreement_accepted, legal_agreement_version, legal_agreement_text, agreement_accepted_at, ip_address, user_agent, created_at) 
       VALUES (1, 1, 'https://storage.agrimarket.ng/signatures/buyer_sig_001.png', 'https://storage.agrimarket.ng/photos/pod_001_1.jpg,https://storage.agrimarket.ng/photos/pod_001_2.jpg', 1, 'Excellent service! Products arrived in perfect condition.', 1, 'v1.0', 'I hereby confirm receipt of the ordered goods in satisfactory condition. I agree to release payment from escrow to the seller.', '2024-01-28 15:30:00', '197.210.76.45', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', '2024-01-28 15:30:00')`,
      
      `INSERT INTO proof_of_delivery (delivery_task_id, order_id, buyer_signature, delivery_photos, buyer_confirmation, buyer_feedback, legal_agreement_accepted, legal_agreement_version, legal_agreement_text, agreement_accepted_at, ip_address, user_agent, created_at) 
       VALUES (2, 2, 'https://storage.agrimarket.ng/signatures/buyer_sig_002.png', 'https://storage.agrimarket.ng/photos/pod_002_1.jpg,https://storage.agrimarket.ng/photos/pod_002_2.jpg,https://storage.agrimarket.ng/photos/pod_002_3.jpg', 1, 'Good quality rice. Delivery was a bit delayed but overall satisfied.', 1, 'v1.0', 'I hereby confirm receipt of the ordered goods in satisfactory condition. I agree to release payment from escrow to the seller.', '2024-01-29 14:20:00', '197.210.55.123', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-01-29 14:20:00')`,
      
      `INSERT INTO proof_of_delivery (delivery_task_id, order_id, buyer_signature, delivery_photos, buyer_confirmation, buyer_feedback, legal_agreement_accepted, legal_agreement_version, legal_agreement_text, agreement_accepted_at, ip_address, user_agent, created_at) 
       VALUES (3, 3, 'https://storage.agrimarket.ng/signatures/buyer_sig_003.png', 'https://storage.agrimarket.ng/photos/pod_003_1.jpg', 1, 'Perfect! Will order again.', 1, 'v1.0', 'I hereby confirm receipt of the ordered goods in satisfactory condition. I agree to release payment from escrow to the seller.', '2024-01-30 16:45:00', '102.89.32.200', 'Mozilla/5.0 (Android 13; Mobile) Chrome/120.0.0.0', '2024-01-30 16:45:00')`,
      
      `INSERT INTO proof_of_delivery (delivery_task_id, order_id, buyer_signature, delivery_photos, buyer_confirmation, buyer_feedback, legal_agreement_accepted, legal_agreement_version, legal_agreement_text, agreement_accepted_at, ip_address, user_agent, created_at) 
       VALUES (6, 6, 'https://storage.agrimarket.ng/signatures/buyer_sig_006.png', 'https://storage.agrimarket.ng/photos/pod_006_1.jpg,https://storage.agrimarket.ng/photos/pod_006_2.jpg', 1, 'Great products and fast delivery. Highly recommended!', 1, 'v1.0', 'I hereby confirm receipt of the ordered goods in satisfactory condition. I agree to release payment from escrow to the seller.', '2024-02-01 11:30:00', '102.89.45.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', '2024-02-01 11:30:00')`,
      
      `INSERT INTO proof_of_delivery (delivery_task_id, order_id, buyer_signature, delivery_photos, buyer_confirmation, buyer_feedback, legal_agreement_accepted, legal_agreement_version, legal_agreement_text, agreement_accepted_at, ip_address, user_agent, created_at) 
       VALUES (9, 9, 'https://storage.agrimarket.ng/signatures/buyer_sig_009.png', 'https://storage.agrimarket.ng/photos/pod_009_1.jpg', 1, 'Fresh tomatoes, excellent quality.', 1, 'v1.0', 'I hereby confirm receipt of the ordered goods in satisfactory condition. I agree to release payment from escrow to the seller.', '2024-02-03 13:45:00', '197.210.99.155', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0', '2024-02-03 13:45:00')`,
      
      `INSERT INTO proof_of_delivery (delivery_task_id, order_id, buyer_signature, delivery_photos, buyer_confirmation, buyer_feedback, legal_agreement_accepted, legal_agreement_version, legal_agreement_text, agreement_accepted_at, ip_address, user_agent, created_at) 
       VALUES (10, 12, 'https://storage.agrimarket.ng/signatures/buyer_sig_012.png', 'https://storage.agrimarket.ng/photos/pod_012_1.jpg,https://storage.agrimarket.ng/photos/pod_012_2.jpg', 1, 'Good quality beans. Packaging was excellent.', 1, 'v1.0', 'I hereby confirm receipt of the ordered goods in satisfactory condition. I agree to release payment from escrow to the seller.', '2024-02-05 17:20:00', '102.89.67.88', 'Mozilla/5.0 (Android 14; Mobile) Chrome/121.0.0.0', '2024-02-05 17:20:00')`
    ];

    for (const insert of podInserts) {
      await connection.execute(insert);
    }
    console.log('✅ Proof of delivery seeded successfully (6 records)\n');

    // Seed Transactions
    console.log('💰 Seeding transactions...');
    const transactionInserts = [
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, payout_ref, created_at, updated_at) 
       VALUES (1, 6, 3, '2250000', '67500', '50000', '2132500', 'order_payment', 'completed', 'ESC-2024-001', 'PAY-2024-001', '2024-01-28 15:45:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, payout_ref, created_at, updated_at) 
       VALUES (2, 7, 3, '1140000', '34200', '40000', '1065800', 'order_payment', 'completed', 'ESC-2024-002', 'PAY-2024-002', '2024-01-29 14:35:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, payout_ref, created_at, updated_at) 
       VALUES (3, 8, 3, '840000', '25200', '35000', '779800', 'order_payment', 'completed', 'ESC-2024-003', 'PAY-2024-003', '2024-01-30 17:00:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, created_at, updated_at) 
       VALUES (4, 6, 3, '1600000', '48000', '45000', '1507000', 'order_payment', 'in_escrow', 'ESC-2024-004', '2024-01-28 13:15:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, created_at, updated_at) 
       VALUES (5, 7, 3, '720000', '21600', '30000', '668400', 'order_payment', 'in_escrow', 'ESC-2024-005', '2024-01-29 09:00:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, payout_ref, created_at, updated_at) 
       VALUES (6, 8, 3, '1025000', '30750', '40000', '954250', 'order_payment', 'completed', 'ESC-2024-006', 'PAY-2024-004', '2024-02-01 11:45:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, created_at, updated_at) 
       VALUES (7, 6, 4, '120000', '3600', '15000', '101400', 'order_payment', 'in_escrow', 'ESC-2024-007', '2024-01-31 14:30:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, created_at, updated_at) 
       VALUES (8, 7, 4, '108000', '3240', '15000', '89760', 'order_payment', 'in_escrow', 'ESC-2024-008', '2024-02-01 09:45:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, payout_ref, created_at, updated_at) 
       VALUES (9, 8, 4, '50000', '1500', '10000', '38500', 'order_payment', 'completed', 'ESC-2024-009', 'PAY-2024-005', '2024-02-03 14:00:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, created_at, updated_at) 
       VALUES (10, 6, 4, '45000', '1350', '10000', '33650', 'order_payment', 'pending', 'ESC-2024-010', '2024-02-03 15:35:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, created_at, updated_at) 
       VALUES (11, 7, 4, '40000', '1200', '10000', '28800', 'order_payment', 'pending', 'ESC-2024-011', '2024-02-04 11:00:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, payout_ref, created_at, updated_at) 
       VALUES (12, 8, 5, '100000', '3000', '15000', '82000', 'order_payment', 'completed', 'ESC-2024-012', 'PAY-2024-006', '2024-02-05 17:35:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, created_at, updated_at) 
       VALUES (13, 6, 5, '98000', '2940', '15000', '80060', 'order_payment', 'in_escrow', 'ESC-2024-013', '2024-02-05 14:15:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, created_at, updated_at) 
       VALUES (14, 7, 5, '90000', '2700', '15000', '72300', 'order_payment', 'in_escrow', 'ESC-2024-014', '2024-02-06 09:30:00', NOW())`,
      
      `INSERT INTO transactions (order_id, buyer_id, seller_id, amount, platform_fee, logistics_fee, net_amount, transaction_type, transaction_status, escrow_account_ref, payout_ref, created_at, updated_at) 
       VALUES (15, 8, 5, '60000', '1800', '12000', '46200', 'order_payment', 'completed', 'ESC-2024-015', 'PAY-2024-007', '2024-02-07 16:45:00', NOW())`
    ];

    for (const insert of transactionInserts) {
      await connection.execute(insert);
    }
    console.log('✅ Transactions seeded successfully (15 transactions)\n');

    // Seed Notifications
    console.log('🔔 Seeding notifications...');
    const notificationInserts = [
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (6, 'order_placed', 'Order Placed Successfully', 'Your order ORD-2024-001 has been placed successfully. Total: ₦2,250,000', 1, '{"orderId": 1, "orderNumber": "ORD-2024-001"}', '2024-01-25 10:05:00', '2024-01-25 10:05:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (3, 'new_order', 'New Order Received', 'You have received a new order ORD-2024-001 for Premium Basmati Rice', 1, '{"orderId": 1, "orderNumber": "ORD-2024-001"}', '2024-01-25 10:05:00', '2024-01-25 10:05:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (9, 'delivery_assigned', 'New Delivery Task', 'You have been assigned a new delivery task for order ORD-2024-001', 1, '{"orderId": 1, "deliveryTaskId": 1}', '2024-01-25 10:30:00', '2024-01-25 10:30:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (6, 'order_in_transit', 'Order In Transit', 'Your order ORD-2024-001 is now in transit and will arrive soon', 1, '{"orderId": 1, "orderNumber": "ORD-2024-001"}', '2024-01-26 10:00:00', '2024-01-26 10:00:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (6, 'order_delivered', 'Order Delivered', 'Your order ORD-2024-001 has been delivered. Please confirm receipt.', 1, '{"orderId": 1, "orderNumber": "ORD-2024-001"}', '2024-01-28 15:00:00', '2024-01-28 15:00:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (3, 'payment_released', 'Payment Released', 'Payment of ₦2,132,500 has been released for order ORD-2024-001', 1, '{"orderId": 1, "amount": "2132500", "payoutRef": "PAY-2024-001"}', '2024-01-28 15:45:00', '2024-01-28 15:45:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (7, 'order_placed', 'Order Placed Successfully', 'Your order ORD-2024-002 has been placed successfully. Total: ₦1,140,000', 1, '{"orderId": 2, "orderNumber": "ORD-2024-002"}', '2024-01-26 11:35:00', '2024-01-26 11:35:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (8, 'order_placed', 'Order Placed Successfully', 'Your order ORD-2024-003 has been placed successfully. Total: ₦840,000', 1, '{"orderId": 3, "orderNumber": "ORD-2024-003"}', '2024-01-27 09:20:00', '2024-01-27 09:20:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (6, 'order_placed', 'Order Placed Successfully', 'Your order ORD-2024-004 has been placed successfully. Total: ₦1,600,000', 0, '{"orderId": 4, "orderNumber": "ORD-2024-004"}', '2024-01-28 13:05:00', '2024-01-28 13:05:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (4, 'product_verified', 'Product Verified', 'Your product White Yam Tubers has been verified and is now available for sale', 1, '{"productId": 8, "productName": "White Yam Tubers"}', '2024-01-20 10:15:00', '2024-01-20 10:15:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (5, 'product_verified', 'Product Verified', 'Your product Honey Beans has been verified and is now available for sale', 1, '{"productId": 15, "productName": "Honey Beans"}', '2024-01-23 08:45:00', '2024-01-23 08:45:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (9, 'delivery_completed', 'Delivery Completed', 'You have successfully completed delivery for order ORD-2024-001', 1, '{"orderId": 1, "deliveryTaskId": 1}', '2024-01-28 15:00:00', '2024-01-28 15:00:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (10, 'delivery_assigned', 'New Delivery Task', 'You have been assigned a new delivery task for order ORD-2024-002', 1, '{"orderId": 2, "deliveryTaskId": 2}', '2024-01-26 12:00:00', '2024-01-26 12:00:00')`,
      
      `INSERT INTO notifications (user_id, notification_type, title, message, is_read, metadata, sent_at, created_at) 
       VALUES (7, 'order_delivered', 'Order Delivered', 'Your order ORD-2024-002 has been delivered. Please confirm receipt.', 1, '{"orderId": 2, "orderNumber": "ORD-2024-002"}', '2024