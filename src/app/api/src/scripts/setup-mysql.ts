import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'maviram',
  multipleStatements: true,
};

// Sample user data with properly formatted PINs
const SAMPLE_USERS = [
  // Admins (2)
  {
    role: 'admin',
    phoneNumber: '+2348012345001',
    pin: '$2a$10$YourHashedPinHere001', // In production, use bcrypt
    email: 'admin1@maviram.com',
    fullName: 'Oluwaseun Adeyemi',
    middleName: 'Oluwatobi',
    gender: 'male',
    dateOfBirth: '1985-05-15',
    address: '12 Victoria Island Road, Lagos',
    location: 'Lagos',
    bankAccountNumber: '0123456789',
    bankAccountName: 'Oluwaseun Adeyemi',
    bankName: 'Access Bank',
    education: 'Masters in Business Administration',
    nin: '12345678901',
    bvn: '22334455667',
    maritalStatus: 'married',
    hasVehicle: 1,
    lineMark: null,
  },
  {
    role: 'admin',
    phoneNumber: '+2348012345002',
    pin: '$2a$10$YourHashedPinHere002',
    email: 'admin2@maviram.com',
    fullName: 'Aisha Mohammed',
    middleName: 'Fatima',
    gender: 'female',
    dateOfBirth: '1988-08-22',
    address: '45 Ahmadu Bello Way, Abuja',
    location: 'Abuja',
    bankAccountNumber: '9876543210',
    bankAccountName: 'Aisha Mohammed',
    bankName: 'GTBank',
    education: 'Masters in Computer Science',
    nin: '98765432109',
    bvn: '77665544332',
    maritalStatus: 'single',
    hasVehicle: 1,
    lineMark: null,
  },
  // Sellers (3)
  {
    role: 'seller',
    phoneNumber: '+2348012345003',
    pin: '$2a$10$YourHashedPinHere003',
    email: 'seller1@maviram.com',
    fullName: 'Chioma Okafor',
    middleName: 'Ngozi',
    gender: 'female',
    dateOfBirth: '1990-03-10',
    address: '78 Aba Road, Port Harcourt',
    location: 'Port Harcourt',
    bankAccountNumber: '1122334455',
    bankAccountName: 'Chioma Okafor',
    bankName: 'Zenith Bank',
    education: 'Bachelor of Agriculture',
    nin: '11223344556',
    bvn: '33445566778',
    maritalStatus: 'married',
    hasVehicle: 0,
    lineMark: 'Farmgate Market',
  },
  {
    role: 'seller',
    phoneNumber: '+2348012345004',
    pin: '$2a$10$YourHashedPinHere004',
    email: 'seller2@maviram.com',
    fullName: 'Emeka Nwankwo',
    middleName: 'Chukwudi',
    gender: 'male',
    dateOfBirth: '1987-11-28',
    address: '23 Onitsha Road, Asaba',
    location: 'Delta',
    bankAccountNumber: '5566778899',
    bankAccountName: 'Emeka Nwankwo',
    bankName: 'UBA',
    education: 'National Diploma in Agriculture',
    nin: '55667788990',
    bvn: '99887766554',
    maritalStatus: 'married',
    hasVehicle: 1,
    lineMark: 'Onitsha Main Market',
  },
  {
    role: 'seller',
    phoneNumber: '+2348012345005',
    pin: '$2a$10$YourHashedPinHere005',
    email: 'seller3@maviram.com',
    fullName: 'Fatima Bello',
    middleName: 'Hauwa',
    gender: 'female',
    dateOfBirth: '1992-07-17',
    address: '34 Kano Road, Kaduna',
    location: 'Kaduna',
    bankAccountNumber: '7788990011',
    bankAccountName: 'Fatima Bello',
    bankName: 'First Bank',
    education: 'Bachelor of Agricultural Economics',
    nin: '77889900112',
    bvn: '11223344556',
    maritalStatus: 'single',
    hasVehicle: 0,
    lineMark: 'Kaduna Central Market',
  },
  // Buyers (3)
  {
    role: 'buyer',
    phoneNumber: '+2348012345006',
    pin: '$2a$10$YourHashedPinHere006',
    email: 'buyer1@maviram.com',
    fullName: 'Tunde Bakare',
    middleName: 'Adekunle',
    gender: 'male',
    dateOfBirth: '1989-01-20',
    address: '56 Ikorodu Road, Lagos',
    location: 'Lagos',
    bankAccountNumber: '2233445566',
    bankAccountName: 'Tunde Bakare',
    bankName: 'Ecobank',
    education: 'Bachelor of Business Administration',
    nin: '22334455667',
    bvn: '44556677889',
    maritalStatus: 'married',
    hasVehicle: 1,
    lineMark: null,
  },
  {
    role: 'buyer',
    phoneNumber: '+2348012345007',
    pin: '$2a$10$YourHashedPinHere007',
    email: 'buyer2@maviram.com',
    fullName: 'Grace Okoro',
    middleName: 'Chidinma',
    gender: 'female',
    dateOfBirth: '1993-09-05',
    address: '89 New Haven, Enugu',
    location: 'Enugu',
    bankAccountNumber: '3344556677',
    bankAccountName: 'Grace Okoro',
    bankName: 'Stanbic IBTC',
    education: 'Bachelor of Food Science',
    nin: '33445566778',
    bvn: '55667788990',
    maritalStatus: 'single',
    hasVehicle: 0,
    lineMark: null,
  },
  {
    role: 'buyer',
    phoneNumber: '+2348012345008',
    pin: '$2a$10$YourHashedPinHere008',
    email: 'buyer3@maviram.com',
    fullName: 'Ibrahim Suleiman',
    middleName: 'Musa',
    gender: 'male',
    dateOfBirth: '1991-04-12',
    address: '67 Ring Road, Ibadan',
    location: 'Oyo',
    bankAccountNumber: '4455667788',
    bankAccountName: 'Ibrahim Suleiman',
    bankName: 'Wema Bank',
    education: 'Masters in Food Processing',
    nin: '44556677889',
    bvn: '66778899001',
    maritalStatus: 'married',
    hasVehicle: 1,
    lineMark: null,
  },
  // Drivers (2)
  {
    role: 'driver',
    phoneNumber: '+2348012345009',
    pin: '$2a$10$YourHashedPinHere009',
    email: 'driver1@maviram.com',
    fullName: 'Yusuf Abubakar',
    middleName: 'Garba',
    gender: 'male',
    dateOfBirth: '1986-06-30',
    address: '12 Sokoto Road, Kano',
    location: 'Kano',
    bankAccountNumber: '5566778800',
    bankAccountName: 'Yusuf Abubakar',
    bankName: 'Union Bank',
    education: 'Secondary School Certificate',
    nin: '55667788001',
    bvn: '77889900112',
    maritalStatus: 'married',
    hasVehicle: 1,
    lineMark: null,
  },
  {
    role: 'driver',
    phoneNumber: '+2348012345010',
    pin: '$2a$10$YourHashedPinHere010',
    email: 'driver2@maviram.com',
    fullName: 'Peter Okonkwo',
    middleName: 'Chukwuemeka',
    gender: 'male',
    dateOfBirth: '1984-12-08',
    address: '90 Warri Road, Benin City',
    location: 'Edo',
    bankAccountNumber: '6677889900',
    bankAccountName: 'Peter Okonkwo',
    bankName: 'Fidelity Bank',
    education: 'National Diploma in Logistics',
    nin: '66778899002',
    bvn: '88990011223',
    maritalStatus: 'married',
    hasVehicle: 1,
    lineMark: null,
  },
];

async function setupDatabase() {
  let connection;

  try {
    console.log('\n🚀 Starting Maviram MySQL Database Setup...\n');

    // Step 1: Connect to MySQL
    console.log('📡 Step 1: Connecting to MySQL...');
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Connected successfully!\n');

    // Step 2: Create database if not exists
    console.log('🗄️  Step 2: Ensuring database exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${MYSQL_CONFIG.database}`);
    await connection.query(`USE ${MYSQL_CONFIG.database}`);
    console.log('✅ Database ready!\n');

    // Step 3: Drop existing tables (in reverse dependency order)
    console.log('🗑️  Step 3: Cleaning up existing tables...');
    const dropTables = [
      'abandoned_processes',
      'activity_logs',
      'notifications',
      'transactions',
      'proof_of_delivery',
      'delivery_tasks',
      'order_items',
      'orders',
      'products',
      'users',
    ];

    for (const table of dropTables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`   ✓ Dropped ${table}`);
    }
    console.log('✅ Cleanup complete!\n');

    // Step 4: Create tables in correct dependency order
    console.log('🏗️  Step 4: Creating tables...\n');

    // 4.1: Users table (no dependencies)
    console.log('   📋 Creating users table...');
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        pin TEXT NOT NULL,
        email TEXT,
        full_name TEXT NOT NULL,
        middle_name TEXT,
        gender TEXT,
        date_of_birth TEXT,
        address TEXT,
        location TEXT,
        bank_account_number TEXT,
        bank_account_name TEXT,
        bank_name TEXT,
        education TEXT,
        nin TEXT,
        bvn TEXT,
        marital_status TEXT,
        has_vehicle TINYINT,
        line_mark TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_phone (phone_number(255))
      )
    `);
    console.log('   ✅ Users table created\n');

    // 4.2: Products table (depends on users)
    console.log('   📦 Creating products table...');
    await connection.query(`
      CREATE TABLE products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        seller_id INT NOT NULL,
        product_name TEXT NOT NULL,
        product_type TEXT NOT NULL,
        quantity INT NOT NULL,
        price_per_unit TEXT NOT NULL,
        total_price TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        list_number INT,
        photos TEXT,
        videos TEXT,
        verified_by INT,
        verified_at TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id)
      )
    `);
    console.log('   ✅ Products table created\n');

    // 4.3: Orders table (depends on users)
    console.log('   🛒 Creating orders table...');
    await connection.query(`
      CREATE TABLE orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_number TEXT NOT NULL,
        buyer_id INT NOT NULL,
        total_amount TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        escrow_status TEXT NOT NULL DEFAULT 'pending',
        order_status TEXT NOT NULL DEFAULT 'placed',
        buyer_approved TINYINT NOT NULL DEFAULT 0,
        buyer_approved_at TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_order_number (order_number(255)),
        FOREIGN KEY (buyer_id) REFERENCES users(id)
      )
    `);
    console.log('   ✅ Orders table created\n');

    // 4.4: Order Items table (depends on orders and products)
    console.log('   📝 Creating order_items table...');
    await connection.query(`
      CREATE TABLE order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_per_unit TEXT NOT NULL,
        total_price TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    console.log('   ✅ Order items table created\n');

    // 4.5: Delivery Tasks table (depends on orders and users)
    console.log('   🚚 Creating delivery_tasks table...');
    await connection.query(`
      CREATE TABLE delivery_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        driver_id INT NOT NULL,
        seller_id INT NOT NULL,
        pickup_address TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        pickup_contact_name TEXT,
        pickup_contact_phone TEXT,
        delivery_contact_name TEXT,
        delivery_contact_phone TEXT,
        status TEXT NOT NULL DEFAULT 'assigned',
        pickup_verification_photos TEXT,
        pickup_qr_code TEXT,
        pickup_verified_at TEXT,
        delivery_signature TEXT,
        delivery_photos TEXT,
        delivery_verified_at TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (driver_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
      )
    `);
    console.log('   ✅ Delivery tasks table created\n');

    // 4.6: Proof of Delivery table (depends on delivery_tasks and orders)
    console.log('   📸 Creating proof_of_delivery table...');
    await connection.query(`
      CREATE TABLE proof_of_delivery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        delivery_task_id INT NOT NULL,
        order_id INT NOT NULL,
        buyer_signature TEXT NOT NULL,
        delivery_photos TEXT NOT NULL,
        buyer_confirmation TINYINT NOT NULL,
        buyer_feedback TEXT,
        legal_agreement_accepted TINYINT NOT NULL,
        legal_agreement_version TEXT,
        legal_agreement_text TEXT NOT NULL,
        agreement_accepted_at TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_task_id) REFERENCES delivery_tasks(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);
    console.log('   ✅ Proof of delivery table created\n');

    // 4.7: Transactions table (depends on orders and users)
    console.log('   💰 Creating transactions table...');
    await connection.query(`
      CREATE TABLE transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        amount TEXT NOT NULL,
        platform_fee TEXT NOT NULL,
        logistics_fee TEXT NOT NULL,
        net_amount TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        transaction_status TEXT NOT NULL DEFAULT 'pending',
        escrow_account_ref TEXT,
        payout_ref TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
      )
    `);
    console.log('   ✅ Transactions table created\n');

    // 4.8: Notifications table (depends on users)
    console.log('   🔔 Creating notifications table...');
    await connection.query(`
      CREATE TABLE notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        notification_type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT NOT NULL DEFAULT 0,
        metadata TEXT,
        sent_at TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('   ✅ Notifications table created\n');

    // 4.9: Activity Logs table (depends on users - optional foreign key)
    console.log('   📊 Creating activity_logs table...');
    await connection.query(`
      CREATE TABLE activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        user_role TEXT,
        activity_type TEXT NOT NULL,
        entity_type TEXT,
        entity_id INT,
        description TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        metadata TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('   ✅ Activity logs table created\n');

    // 4.10: Abandoned Processes table (no dependencies)
    console.log('   ⚠️  Creating abandoned_processes table...');
    await connection.query(`
      CREATE TABLE abandoned_processes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        process_type TEXT NOT NULL,
        entity_id INT NOT NULL,
        status TEXT NOT NULL DEFAULT 'detected',
        detected_at TEXT NOT NULL,
        last_notified_at TEXT,
        resolved_at TEXT,
        resolution_action TEXT,
        metadata TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Abandoned processes table created\n');

    console.log('✅ All tables created successfully!\n');

    // Step 5: Seed users
    console.log('🌱 Step 5: Seeding sample users...\n');

    for (let i = 0; i < SAMPLE_USERS.length; i++) {
      const user = SAMPLE_USERS[i];
      await connection.query(
        `INSERT INTO users (
          role, phone_number, pin, email, full_name, middle_name, gender,
          date_of_birth, address, location, bank_account_number, bank_account_name,
          bank_name, education, nin, bvn, marital_status, has_vehicle, line_mark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.role,
          user.phoneNumber,
          user.pin,
          user.email,
          user.fullName,
          user.middleName,
          user.gender,
          user.dateOfBirth,
          user.address,
          user.location,
          user.bankAccountNumber,
          user.bankAccountName,
          user.bankName,
          user.education,
          user.nin,
          user.bvn,
          user.maritalStatus,
          user.hasVehicle,
          user.lineMark,
        ]
      );
      console.log(`   ✓ Created ${user.role}: ${user.fullName} (${user.phoneNumber})`);
    }

    console.log('\n✅ All users seeded successfully!\n');

    // Step 6: Verify setup
    console.log('🔍 Step 6: Verifying setup...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`   ✓ Total tables created: ${tables.length}`);

    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`   ✓ Total users: ${userCount[0].count}`);

    const [roleBreakdown] = await connection.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    console.log('\n   📊 User breakdown by role:');
    roleBreakdown.forEach((row: any) => {
      console.log(`      • ${row.role}: ${row.count}`);
    });

    console.log('\n✅ Verification complete!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database setup completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Summary:');
    console.log(`   • Database: ${MYSQL_CONFIG.database}`);
    console.log(`   • Host: ${MYSQL_CONFIG.host}`);
    console.log(`   • Tables: ${tables.length}`);
    console.log(`   • Sample Users: ${SAMPLE_USERS.length}`);
    console.log(`   • Admins: 2 | Sellers: 3 | Buyers: 3 | Drivers: 2`);
    console.log('\n💡 Next steps:');
    console.log('   1. Start your Next.js app: npm run dev');
    console.log('   2. Test API endpoints: http://localhost:3000/api/*');
    console.log('   3. Check logs: Activity logs table is ready');
    console.log('\n✨ Happy coding!\n');

  } catch (error) {
    console.error('\n❌ ERROR: Database setup failed!\n');
    console.error('Details:', error);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Verify MySQL is running: mysql -u root -p');
    console.error('   2. Check .env file has correct credentials');
    console.error('   3. Ensure MySQL user has CREATE/DROP permissions');
    console.error('   4. Check MySQL version is 5.7+ or 8.0+');
    console.error('\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.\n');
    }
  }
}

// Run the setup
setupDatabase();