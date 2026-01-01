-- Maviram Database Setup Script
-- Run this script on your MySQL database to create all required tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  pin VARCHAR(4) NOT NULL,
  email VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  gender VARCHAR(10),
  date_of_birth VARCHAR(50),
  address TEXT,
  location VARCHAR(255),
  bank_account_number VARCHAR(50),
  bank_account_name VARCHAR(255),
  bank_name VARCHAR(100),
  education VARCHAR(100),
  nin VARCHAR(20),
  bvm VARCHAR(50),
  marital_status VARCHAR(20),
  has_vehicle TINYINT,
  line_mark TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  list_number INT,
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  photos LONGTEXT,
  videos LONGTEXT,
  verified_by_driver_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (verified_by_driver_id) REFERENCES users(id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL UNIQUE,
  buyer_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  delivery_option VARCHAR(100),
  buyer_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  seller_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  unique_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Create delivery_tasks table
CREATE TABLE IF NOT EXISTS delivery_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  driver_id INT,
  seller_id INT NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pickup_contact VARCHAR(20) NOT NULL,
  delivery_contact VARCHAR(20) NOT NULL,
  product_details LONGTEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'assigned',
  pickup_verification_photos LONGTEXT,
  pickup_qr_code TEXT,
  pickup_timestamp TIMESTAMP NULL,
  delivery_timestamp TIMESTAMP NULL,
  assigned_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (driver_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Create proof_of_delivery table
CREATE TABLE IF NOT EXISTS proof_of_delivery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  delivery_task_id INT NOT NULL,
  order_id INT NOT NULL,
  buyer_signature TEXT NOT NULL,
  delivery_photos LONGTEXT NOT NULL,
  buyer_confirmation TINYINT NOT NULL,
  buyer_feedback TEXT,
  legal_agreement_accepted TINYINT NOT NULL,
  legal_agreement_version VARCHAR(50),
  legal_agreement_text LONGTEXT NOT NULL,
  agreement_accepted_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_task_id) REFERENCES delivery_tasks(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  net_to_seller DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  escrow_reference VARCHAR(100) NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT,
  notification_type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT NOT NULL DEFAULT 0,
  sent_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_role VARCHAR(20),
  activity_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  description TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata LONGTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create abandoned_processes table
CREATE TABLE IF NOT EXISTS abandoned_processes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  process_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'detected',
  detected_at TIMESTAMP NOT NULL,
  last_notified_at TIMESTAMP NULL,
  resolved_at TIMESTAMP NULL,
  resolution_action TEXT,
  metadata LONGTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);