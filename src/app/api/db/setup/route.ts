import { NextRequest, NextResponse } from 'next/server';
import { poolConnection } from '@/db';

export async function POST(request: NextRequest) {
  try {
    // Create all tables
    const createTableSQL = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        pin VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        full_name VARCHAR(255) NOT NULL,
        middle_name VARCHAR(255),
        gender VARCHAR(20),
        date_of_birth DATE,
        address TEXT,
        location VARCHAR(255),
        bank_account_number VARCHAR(50),
        bank_account_name VARCHAR(255),
        bank_name VARCHAR(255),
        education VARCHAR(255),
        nin VARCHAR(50),
        bvn VARCHAR(50),
        marital_status VARCHAR(50),
        has_vehicle VARCHAR(10),
        line_mark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_type VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        price_per_unit DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'available',
        list_number INT,
        photos TEXT,
        videos TEXT,
        verified_by INT,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id)
      )`,
      
      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        buyer_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        delivery_address TEXT NOT NULL,
        escrow_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        order_status VARCHAR(50) NOT NULL DEFAULT 'placed',
        buyer_approved TINYINT(1) NOT NULL DEFAULT 0,
        buyer_approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id)
      )`,
      
      // Order Items table
      `CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_per_unit DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`,
      
      // Delivery Tasks table
      `CREATE TABLE IF NOT EXISTS delivery_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        driver_id INT NOT NULL,
        seller_id INT NOT NULL,
        pickup_address TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        pickup_contact_name VARCHAR(255),
        pickup_contact_phone VARCHAR(20),
        delivery_contact_name VARCHAR(255),
        delivery_contact_phone VARCHAR(20),
        status VARCHAR(50) NOT NULL DEFAULT 'assigned',
        pickup_verification_photos TEXT,
        pickup_qr_code VARCHAR(255),
        pickup_verified_at TIMESTAMP,
        delivery_signature TEXT,
        delivery_photos TEXT,
        delivery_verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (driver_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
      )`,
      
      // Proof of Delivery table
      `CREATE TABLE IF NOT EXISTS proof_of_delivery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        delivery_task_id INT NOT NULL,
        order_id INT NOT NULL,
        buyer_signature TEXT NOT NULL,
        delivery_photos TEXT NOT NULL,
        buyer_confirmation TINYINT(1) NOT NULL,
        buyer_feedback TEXT,
        legal_agreement_accepted TINYINT(1) NOT NULL,
        legal_agreement_version VARCHAR(50),
        legal_agreement_text TEXT NOT NULL,
        agreement_accepted_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_task_id) REFERENCES delivery_tasks(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )`,
      
      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        platform_fee DECIMAL(10, 2) NOT NULL,
        logistics_fee DECIMAL(10, 2) NOT NULL,
        net_amount DECIMAL(10, 2) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        transaction_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        escrow_account_ref VARCHAR(255),
        payout_ref VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
      )`,
      
      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notification_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        metadata TEXT,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      
      // Activity Logs table
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_role VARCHAR(50),
        activity_type VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        description TEXT NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      
      // Abandoned Processes table
      `CREATE TABLE IF NOT EXISTS abandoned_processes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        process_type VARCHAR(100) NOT NULL,
        entity_id INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'detected',
        detected_at TIMESTAMP NOT NULL,
        last_notified_at TIMESTAMP,
        resolved_at TIMESTAMP,
        resolution_action VARCHAR(255),
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    ];

    // Execute all CREATE TABLE statements
    for (const sql of createTableSQL) {
      await poolConnection.query(sql);
    }

    // Seed users
    const users = [
      {
        role: 'admin',
        phone_number: '+2348012345678',
        pin: '1234',
        email: 'chukwuemeka.okonkwo@farmconnect.ng',
        full_name: 'Chukwuemeka Okonkwo',
        middle_name: 'Chibuike',
        gender: 'male',
        date_of_birth: '1985-03-15',
        address: '45 Allen Avenue, Ikeja, Lagos',
        location: 'Lagos',
        bank_account_number: '0123456789',
        bank_account_name: 'Chukwuemeka Okonkwo',
        bank_name: 'GTBank',
        education: 'Bachelor of Science in Computer Science',
        nin: '12345678901',
        bvn: '22334455667',
        marital_status: 'married',
        has_vehicle: 'yes',
        line_mark: 'Scar on left arm',
      },
      {
        role: 'buyer',
        phone_number: '+2348038523883',
        pin: '5678',
        email: 'oluwaseun.adeyemi@gmail.com',
        full_name: 'Oluwaseun Adeyemi',
        middle_name: 'Ayomide',
        gender: 'male',
        date_of_birth: '1990-06-12',
        address: '89 Victoria Island, Lagos',
        location: 'Lagos',
        bank_account_number: '5678901234',
        bank_account_name: 'Oluwaseun Adeyemi',
        bank_name: 'GTBank',
        education: 'Bachelor of Arts in Hospitality Management',
        nin: '56789012345',
        bvn: '66778899001',
        marital_status: 'single',
        has_vehicle: 'yes',
        line_mark: 'Tattoo on right arm',
      },
      {
        role: 'seller',
        phone_number: '+2348023456789',
        pin: '2468',
        email: 'ibrahim.mohammed@gmail.com',
        full_name: 'Ibrahim Mohammed',
        middle_name: 'Suleiman',
        gender: 'male',
        date_of_birth: '1980-11-05',
        address: '23 Bompai Road, Kano',
        location: 'Kano',
        bank_account_number: '2345678901',
        bank_account_name: 'Ibrahim Mohammed',
        bank_name: 'First Bank',
        education: 'Secondary School Certificate',
        nin: '23456789012',
        bvn: '33445566778',
        marital_status: 'married',
        has_vehicle: 'no',
        line_mark: 'None',
      },
      {
        role: 'driver',
        phone_number: '+2348056789012',
        pin: '9753',
        email: 'yusuf.garba@logistics.ng',
        full_name: 'Yusuf Garba',
        middle_name: 'Abubakar',
        gender: 'male',
        date_of_birth: '1995-08-14',
        address: '101 Ahmadu Bello Way, Abuja',
        location: 'Abuja',
        bank_account_number: '8901234567',
        bank_account_name: 'Yusuf Garba',
        bank_name: 'Access Bank',
        education: 'Senior Secondary School Certificate',
        nin: '89012345678',
        bvn: '99001122334',
        marital_status: 'single',
        has_vehicle: 'yes',
        line_mark: 'Birthmark on neck',
      },
    ];

    const insertUserSQL = `INSERT INTO users (role, phone_number, pin, email, full_name, middle_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, education, nin, bvn, marital_status, has_vehicle, line_mark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    for (const user of users) {
      await poolConnection.query(insertUserSQL, [
        user.role,
        user.phone_number,
        user.pin,
        user.email,
        user.full_name,
        user.middle_name,
        user.gender,
        user.date_of_birth,
        user.address,
        user.location,
        user.bank_account_number,
        user.bank_account_name,
        user.bank_name,
        user.education,
        user.nin,
        user.bvn,
        user.marital_status,
        user.has_vehicle,
        user.line_mark,
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created and seeded successfully',
      tables: [
        'users',
        'products',
        'orders',
        'order_items',
        'delivery_tasks',
        'proof_of_delivery',
        'transactions',
        'notifications',
        'activity_logs',
        'abandoned_processes',
      ],
      seedData: {
        users: users.length,
      },
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to set up database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}