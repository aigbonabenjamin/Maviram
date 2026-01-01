import mysql from 'mysql2/promise';

async function createConnection() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'maviram',
    multipleStatements: true
  });
}

async function dropTables(connection: mysql.Connection) {
  console.log('Dropping existing tables...');
  
  const dropOrder = [
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

  for (const table of dropOrder) {
    try {
      await connection.execute(`DROP TABLE IF EXISTS ${table}`);
      console.log(`✓ Dropped table: ${table}`);
    } catch (error) {
      console.error(`✗ Error dropping table ${table}:`, error);
      throw error;
    }
  }
}

async function createUsersTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: users');
  } catch (error) {
    console.error('✗ Error creating users table:', error);
    throw error;
  }
}

async function createProductsTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE products (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (verified_by) REFERENCES users(id)
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: products');
  } catch (error) {
    console.error('✗ Error creating products table:', error);
    throw error;
  }
}

async function createOrdersTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number TEXT NOT NULL,
      buyer_id INT NOT NULL,
      total_amount TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      escrow_status TEXT NOT NULL DEFAULT 'pending',
      order_status TEXT NOT NULL DEFAULT 'placed',
      buyer_approved TINYINT NOT NULL DEFAULT 0,
      buyer_approved_at TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (buyer_id) REFERENCES users(id)
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: orders');
  } catch (error) {
    console.error('✗ Error creating orders table:', error);
    throw error;
  }
}

async function createOrderItemsTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price_per_unit TEXT NOT NULL,
      total_price TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: order_items');
  } catch (error) {
    console.error('✗ Error creating order_items table:', error);
    throw error;
  }
}

async function createDeliveryTasksTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE delivery_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (driver_id) REFERENCES users(id),
      FOREIGN KEY (seller_id) REFERENCES users(id)
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: delivery_tasks');
  } catch (error) {
    console.error('✗ Error creating delivery_tasks table:', error);
    throw error;
  }
}

async function createProofOfDeliveryTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE proof_of_delivery (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (delivery_task_id) REFERENCES delivery_tasks(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: proof_of_delivery');
  } catch (error) {
    console.error('✗ Error creating proof_of_delivery table:', error);
    throw error;
  }
}

async function createTransactionsTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id) REFERENCES users(id)
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: transactions');
  } catch (error) {
    console.error('✗ Error creating transactions table:', error);
    throw error;
  }
}

async function createNotificationsTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      notification_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT NOT NULL DEFAULT 0,
      metadata TEXT,
      sent_at TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: notifications');
  } catch (error) {
    console.error('✗ Error creating notifications table:', error);
    throw error;
  }
}

async function createActivityLogsTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      user_role TEXT,
      activity_type TEXT NOT NULL,
      entity_type TEXT,
      entity_id INT,
      description TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: activity_logs');
  } catch (error) {
    console.error('✗ Error creating activity_logs table:', error);
    throw error;
  }
}

async function createAbandonedProcessesTable(connection: mysql.Connection) {
  const sql = `
    CREATE TABLE abandoned_processes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      process_type TEXT NOT NULL,
      entity_id INT NOT NULL,
      status TEXT NOT NULL DEFAULT 'detected',
      detected_at TEXT NOT NULL,
      last_notified_at TEXT,
      resolved_at TEXT,
      resolution_action TEXT,
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )
  `;
  
  try {
    await connection.execute(sql);
    console.log('✓ Created table: abandoned_processes');
  } catch (error) {
    console.error('✗ Error creating abandoned_processes table:', error);
    throw error;
  }
}

export async function main() {
  let connection: mysql.Connection | null = null;

  try {
    console.log('Connecting to MySQL database...');
    connection = await createConnection();
    console.log('✓ Connected to MySQL database');

    await dropTables(connection);
    console.log('✓ All tables dropped successfully\n');

    console.log('Creating tables...');
    await createUsersTable(connection);
    await createProductsTable(connection);
    await createOrdersTable(connection);
    await createOrderItemsTable(connection);
    await createDeliveryTasksTable(connection);
    await createProofOfDeliveryTable(connection);
    await createTransactionsTable(connection);
    await createNotificationsTable(connection);
    await createActivityLogsTable(connection);
    await createAbandonedProcessesTable(connection);

    console.log('\n✓ All tables created successfully!');
    console.log('Database setup completed.');

  } catch (error) {
    console.error('\n✗ Database setup failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✓ Database connection closed');
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});