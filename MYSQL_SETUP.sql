-- MySQL Database Setup for Maviram Food Delivery
-- Execute this script in MySQL Workbench or phpMyAdmin

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS maviram;
USE maviram;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  pin VARCHAR(4) NOT NULL,
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
  nin VARCHAR(20),
  bvn VARCHAR(20),
  marital_status VARCHAR(50),
  has_vehicle BOOLEAN DEFAULT FALSE,
  line_mark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone_number),
  INDEX idx_role (role)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
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
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_seller (seller_id),
  INDEX idx_status (status)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  buyer_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  escrow_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  order_status VARCHAR(50) NOT NULL DEFAULT 'placed',
  buyer_approved BOOLEAN DEFAULT FALSE,
  buyer_approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_buyer (buyer_id),
  INDEX idx_order_number (order_number),
  INDEX idx_order_status (order_status)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);

-- Delivery Tasks table
CREATE TABLE IF NOT EXISTS delivery_tasks (
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
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_driver (driver_id),
  INDEX idx_status (status)
);

-- Proof of Delivery table
CREATE TABLE IF NOT EXISTS proof_of_delivery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  delivery_task_id INT NOT NULL,
  order_id INT NOT NULL,
  buyer_signature TEXT NOT NULL,
  delivery_photos TEXT NOT NULL,
  buyer_confirmation BOOLEAN NOT NULL,
  buyer_feedback TEXT,
  legal_agreement_accepted BOOLEAN NOT NULL,
  legal_agreement_version VARCHAR(50),
  legal_agreement_text TEXT NOT NULL,
  agreement_accepted_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_task_id) REFERENCES delivery_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_delivery_task (delivery_task_id),
  INDEX idx_order (order_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
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
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_transaction_status (transaction_status)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSON,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_is_read (is_read)
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_role VARCHAR(50),
  activity_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  description TEXT NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
);

-- Abandoned Processes table
CREATE TABLE IF NOT EXISTS abandoned_processes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  process_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'detected',
  detected_at TIMESTAMP NOT NULL,
  last_notified_at TIMESTAMP,
  resolved_at TIMESTAMP,
  resolution_action VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_process_type (process_type),
  INDEX idx_status (status)
);

-- Insert seed data
INSERT INTO users (role, phone_number, pin, email, full_name, middle_name, gender, date_of_birth, address, location, bank_account_number, bank_account_name, bank_name, education, nin, bvn, marital_status, has_vehicle, line_mark) VALUES
('admin', '+2348012345678', '1234', 'chukwuemeka.okonkwo@farmconnect.ng', 'Chukwuemeka Okonkwo', 'Chibuike', 'male', '1985-03-15', '45 Allen Avenue, Ikeja, Lagos', 'Lagos', '0123456789', 'Chukwuemeka Okonkwo', 'GTBank', 'Bachelor of Science in Computer Science', '12345678901', '22334455667', 'married', TRUE, 'Scar on left arm'),
('buyer', '08038523883', '5678', 'oluwaseun.adeyemi@gmail.com', 'Oluwaseun Adeyemi', 'Ayomide', 'male', '1990-06-12', '89 Victoria Island, Lagos', 'Lagos', '5678901234', 'Oluwaseun Adeyemi', 'GTBank', 'Bachelor of Arts in Hospitality Management', '56789012345', '66778899001', 'single', TRUE, 'Tattoo on right arm'),
('seller', '+2348023456789', '2468', 'ibrahim.mohammed@gmail.com', 'Ibrahim Mohammed', 'Suleiman', 'male', '1980-11-05', '23 Bompai Road, Kano', 'Kano', '2345678901', 'Ibrahim Mohammed', 'First Bank', 'Secondary School Certificate', '23456789012', '33445566778', 'married', FALSE, 'None'),
('driver', '+2348056789012', '9753', 'yusuf.garba@logistics.ng', 'Yusuf Garba', 'Abubakar', 'male', '1995-08-14', '101 Ahmadu Bello Way, Abuja', 'Abuja', '8901234567', 'Yusuf Garba', 'Access Bank', 'Senior Secondary School Certificate', '89012345678', '99001122334', 'single', TRUE, 'Birthmark on neck');

-- Insert sample products
INSERT INTO products (seller_id, product_name, product_type, quantity, price_per_unit, total_price, status, list_number, verified_by, verified_at) VALUES
(3, 'Premium Yellow Maize', 'Maize', 50, 25000.00, 1250000.00, 'available', 1, 4, NOW()),
(3, 'Fresh Tomatoes', 'Vegetables', 100, 5000.00, 500000.00, 'available', 2, 4, NOW());