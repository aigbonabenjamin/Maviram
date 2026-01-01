# Maviram Food Delivery Platform - MySQL Database Setup Guide

## Table of Contents
1. [Prerequisites Check](#prerequisites-check)
2. [Starting MySQL Server](#starting-mysql-server)
3. [Database Setup Methods](#database-setup-methods)
4. [Verification Steps](#verification-steps)
5. [Testing API Endpoints](#testing-api-endpoints)
6. [Sample User Credentials](#sample-user-credentials)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites Check

### 1. Verify MySQL Installation

**Windows:**
bash
mysql --version

**macOS/Linux:**
bash
mysql --version

**Expected Output:**
mysql  Ver 8.0.x for [your-os]

If MySQL is not installed:
- **Windows:** Download from [MySQL Community Downloads](https://dev.mysql.com/downloads/installer/)
- **macOS:** `brew install mysql`
- **Linux:** `sudo apt-get install mysql-server` (Ubuntu/Debian) or `sudo yum install mysql-server` (CentOS/RHEL)

### 2. Verify Environment Variables

Create or verify your `.env` file in the project root:

env
# Database Configuration
DATABASE_URL=mysql://root:your_password@localhost:3306/maviram_db

# Application Configuration
NODE_ENV=development
PORT=3000

# JWT Secret (for future authentication)
JWT_SECRET=your-secret-key-change-this-in-production

**Important Notes:**
- Replace `your_password` with your actual MySQL root password
- If your MySQL runs on a different port, change `3306` accordingly
- The database name `maviram_db` will be created during setup

---

## Starting MySQL Server

### Windows

**Method 1: Using Services**
1. Press `Win + R`, type `services.msc`, and press Enter
2. Find "MySQL" or "MySQL80" in the list
3. Right-click and select "Start"

**Method 2: Using Command Prompt (as Administrator)**
bash
net start MySQL80

**Expected Output:**
The MySQL80 service is starting.
The MySQL80 service was started successfully.

### macOS

**Method 1: Using Homebrew**
bash
brew services start mysql

**Method 2: Using MySQL Command**
bash
mysql.server start

**Expected Output:**
Starting MySQL
. SUCCESS!

### Linux (Ubuntu/Debian)

bash
sudo systemctl start mysql

**Check Status:**
bash
sudo systemctl status mysql

**Expected Output:**
● mysql.service - MySQL Community Server
   Active: active (running)

### Verify MySQL is Running

bash
mysql -u root -p

Enter your password when prompted. If successful, you'll see:
Welcome to the MySQL monitor.
mysql>

Type `exit` to close the MySQL prompt.

---

## Database Setup Methods

### Method A: Using the `/api/db/setup` Endpoint (Recommended) ⭐

This is the **easiest and recommended method** for development and testing.

#### Step 1: Start Your Next.js Application

bash
npm run dev

**Expected Output:**
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
   - Ready in X.Xs

#### Step 2: Call the Setup Endpoint

**Using cURL (Command Line):**

bash
curl -X POST http://localhost:3000/api/db/setup \
  -H "Content-Type: application/json" \
  | json_pp

**Using PowerShell (Windows):**

powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/db/setup" -Method POST -ContentType "application/json" | ConvertTo-Json

**Using Browser (Visit this URL):**
http://localhost:3000/api/db/setup

**Or use Postman/Thunder Client:**
- Method: `POST`
- URL: `http://localhost:3000/api/db/setup`
- Headers: `Content-Type: application/json`

#### Expected Response:

on
{
  "success": true,
  "message": "Database setup completed successfully",
  "details": {
    "database": "maviram_db",
    "tablesCreated": [
      "users",
      "products",
      "orders",
      "order_items",
      "delivery_tasks",
      "proof_of_delivery",
      "transactions",
      "notifications",
      "activity_logs",
      "abandoned_processes"
    ],
    "sampleDataInserted": {
      "users": 10,
      "activityLogs": 10
    }
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}

**What This Does:**
1. ✅ Creates the `maviram_db` database (if it doesn't exist)
2. ✅ Creates all 10 tables with proper schema
3. ✅ Inserts 10 sample users (Admin, Sellers, Buyers, Drivers)
4. ✅ Creates activity logs for testing
5. ✅ Verifies all tables were created successfully

---

### Method B: Using Drizzle Kit Push

This method uses Drizzle's migration tool.

#### Step 1: Install Dependencies (if not already installed)

bash
npm install drizzle-orm mysql2
npm install -D drizzle-kit

#### Step 2: Create Drizzle Configuration

Create `drizzle.config.ts` in your project root:

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    uri: process.env.DATABASE_URL!,
  },
} satisfies Config;

#### Step 3: Push Schema to Database

bash
npx drizzle-kit push:mysql

**Expected Output:**
 Reading schema from ./src/db/schema.ts
 Pushing schema to database...
 ✓ Schema pushed successfully

#### Step 4: Insert Sample Data

Run this Node.js script:

// scripts/insert-sample-data.js
import { db } from './src/db/index.js';
import { users, activityLogs } from './src/db/schema.js';

const sampleUsers = [
  {
    role: 'admin',
    phoneNumber: '08012345670',
    pin: '123456',
    fullName: 'Admin User',
    gender: 'male',
    address: '1 Admin Street, Lagos',
    location: 'Lagos',
  },
  // ... (add all 10 users here)
];

async function insertSampleData() {
  for (const user of sampleUsers) {
    await db.insert(users).values(user);
  }
  console.log('Sample data inserted successfully');
}

insertSampleData();

Run it:
bash
node scripts/insert-sample-data.js

---

### Method C: Manual SQL Commands

For advanced users who prefer direct SQL control.

#### Step 1: Connect to MySQL

bash
mysql -u root -p

#### Step 2: Create Database

sql
CREATE DATABASE IF NOT EXISTS maviram_db;
USE maviram_db;

#### Step 3: Create Tables

sql
-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Orders Table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_id INT NOT NULL,
  total_amount TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  escrow_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'placed',
  buyer_approved TINYINT NOT NULL DEFAULT 0,
  buyer_approved_at TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_unit TEXT NOT NULL,
  total_price TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Delivery Tasks Table
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (driver_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Proof of Delivery Table
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_task_id) REFERENCES delivery_tasks(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Transactions Table
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Notifications Table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT NOT NULL DEFAULT 0,
  metadata TEXT,
  sent_at TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Activity Logs Table
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Abandoned Processes Table
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

#### Step 4: Insert Sample Users

sql
-- Insert 10 Sample Users
INSERT INTO users (role, phone_number, pin, full_name, gender, address, location) VALUES
('admin', '08012345670', '123456', 'Admin User', 'male', '1 Admin Street, Lagos', 'Lagos'),
('seller', '08012345671', '234567', 'Amina Mohammed', 'female', '45 Market Road, Kano', 'Kano'),
('seller', '08012345672', '345678', 'Chidi Okonkwo', 'male', '12 Trade Avenue, Onitsha', 'Onitsha'),
('buyer', '08012345673', '456789', 'Fatima Hassan', 'female', '78 Residential Close, Abuja', 'Abuja'),
('buyer', '08012345674', '567890', 'Tunde Bakare', 'male', '23 Consumer Lane, Ibadan', 'Ibadan'),
('driver', '08012345675', '678901', 'Ibrahim Yusuf', 'male', '56 Transport Hub, Lagos', 'Lagos'),
('driver', '08012345676', '789012', 'Ngozi Eze', 'female', '34 Delivery Street, Port Harcourt', 'Port Harcourt'),
('seller', '08012345677', '890123', 'Usman Bello', 'male', '89 Commerce Road, Kaduna', 'Kaduna'),
('buyer', '08012345678', '901234', 'Grace Adeyemi', 'female', '67 Shopping District, Abeokuta', 'Abeokuta'),
('driver', '08012345679', '012345', 'Musa Abdullahi', 'male', '90 Logistics Center, Kano', 'Kano');

-- Insert Activity Logs
INSERT INTO activity_logs (user_id, user_role, activity_type, description) VALUES
(1, 'admin', 'user_login', 'Admin logged into the system'),
(2, 'seller', 'product_listed', 'Listed fresh tomatoes for sale'),
(3, 'seller', 'product_listed', 'Listed yam tubers for sale'),
(4, 'buyer', 'order_placed', 'Placed order for tomatoes'),
(5, 'buyer', 'order_placed', 'Placed order for yam'),
(6, 'driver', 'delivery_assigned', 'Assigned to deliver Order #1001'),
(7, 'driver', 'delivery_completed', 'Completed delivery for Order #1002'),
(1, 'admin', 'system_check', 'Performed routine system check'),
(8, 'seller', 'product_updated', 'Updated pepper prices'),
(9, 'buyer', 'user_registration', 'Registered as new buyer');

#### Step 5: Verify Tables Created

sql
SHOW TABLES;

**Expected Output:**
+------------------------+
| Tables_in_maviram_db   |
+------------------------+
| abandoned_processes    |
| activity_logs          |
| delivery_tasks         |
| notifications          |
| order_items            |
| orders                 |
| products               |
| proof_of_delivery      |
| transactions           |
| users                  |
+------------------------+
10 rows in set

---

## Verification Steps

### 1. Verify Database Exists

sql
SHOW DATABASES LIKE 'maviram_db';

**Expected Output:**
+------------------------+
| Database (maviram_db)  |
+------------------------+
| maviram_db             |
+------------------------+

### 2. Verify All Tables Exist

bash
mysql -u root -p -D maviram_db -e "SHOW TABLES;"

**Expected Output:**
+------------------------+
| Tables_in_maviram_db   |
+------------------------+
| abandoned_processes    |
| activity_logs          |
| delivery_tasks         |
| notifications          |
| order_items            |
| orders                 |
| products               |
| proof_of_delivery      |
| transactions           |
| users                  |
+------------------------+

### 3. Verify Sample Users Inserted

sql
SELECT id, role, phone_number, full_name FROM users;

**Expected Output:**
+----+--------+---------------+------------------+
| id | role   | phone_number  | full_name        |
+----+--------+---------------+------------------+
|  1 | admin  | 08012345670   | Admin User       |
|  2 | seller | 08012345671   | Amina Mohammed   |
|  3 | seller | 08012345672   | Chidi Okonkwo    |
|  4 | buyer  | 08012345673   | Fatima Hassan    |
|  5 | buyer  | 08012345674   | Tunde Bakare     |
|  6 | driver | 08012345675   | Ibrahim Yusuf    |
|  7 | driver | 08012345676   | Ngozi Eze        |
|  8 | seller | 08012345677   | Usman Bello      |
|  9 | buyer  | 08012345678   | Grace Adeyemi    |
| 10 | driver | 08012345679   | Musa Abdullahi   |
+----+--------+---------------+------------------+

### 4. Verify Table Structure

sql
DESCRIBE users;

**Expected Output:**
+----------------------+------------+------+-----+---------+----------------+
| Field                | Type       | Null | Key | Default | Extra          |
+----------------------+------------+------+-----+---------+----------------+
| id                   | int        | NO   | PRI | NULL    | auto_increment |
| role                 | text       | NO   |     | NULL    |                |
| phone_number         | text       | NO   | UNI | NULL    |                |
| pin                  | text       | NO   |     | NULL    |                |
| email                | text       | YES  |     | NULL    |                |
| full_name            | text       | NO   |     | NULL    |                |
...

---

## Testing API Endpoints

### 1. Test Database Connection

**Endpoint:** `GET /api/health`

bash
curl http://localhost:3000/api/health

**Expected Response:**
on
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:45.123Z"
}

### 2. Test Users API

**Get All Users:**
bash
curl http://localhost:3000/api/users

**Expected Response:**
on
[
  {
    "id": 1,
    "role": "admin",
    "phoneNumber": "08012345670",
    "fullName": "Admin User",
    "gender": "male",
    "address": "1 Admin Street, Lagos",
    "location": "Lagos",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  // ... more users
]

**Get User by ID:**
bash
curl http://localhost:3000/api/users?id=1

**Search Users:**
bash
curl "http://localhost:3000/api/users?search=Amina"

**Filter by Role:**
bash
curl "http://localhost:3000/api/users?role=seller"

### 3. Test Activity Logs API

bash
curl http://localhost:3000/api/activity-logs

**Expected Response:**
on
[
  {
    "id": 1,
    "userId": 1,
    "userRole": "admin",
    "activityType": "user_login",
    "description": "Admin logged into the system",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  // ... more logs
]

### 4. Test Products API (Empty Initially)

bash
curl http://localhost:3000/api/products

**Expected Response:**
on
[]

### 5. Test Creating a Product

bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 2,
    "productName": "Fresh Tomatoes",
    "productType": "Vegetables",
    "quantity": 100,
    "pricePerUnit": "500",
    "totalPrice": "50000"
  }'

**Expected Response:**
on
{
  "id": 1,
  "sellerId": 2,
  "productName": "Fresh Tomatoes",
  "productType": "Vegetables",
  "quantity": 100,
  "pricePerUnit": "500",
  "totalPrice": "50000",
  "status": "available",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}

---

## Sample User Credentials

Use these credentials for testing authentication and role-based features:

### 📋 All Sample Users

| ID | Role   | Phone Number  | PIN    | Full Name         | Location      |
|----|--------|---------------|--------|-------------------|---------------|
| 1  | admin  | 08012345670   | 123456 | Admin User        | Lagos         |
| 2  | seller | 08012345671   | 234567 | Amina Mohammed    | Kano          |
| 3  | seller | 08012345672   | 345678 | Chidi Okonkwo     | Onitsha       |
| 4  | buyer  | 08012345673   | 456789 | Fatima Hassan     | Abuja         |
| 5  | buyer  | 08012345674   | 567890 | Tunde Bakare      | Ibadan        |
| 6  | driver | 08012345675   | 678901 | Ibrahim Yusuf     | Lagos         |
| 7  | driver | 08012345676   | 789012 | Ngozi Eze         | Port Harcourt |
| 8  | seller | 08012345677   | 890123 | Usman Bello       | Kaduna        |
| 9  | buyer  | 08012345678   | 901234 | Grace Adeyemi     | Abeokuta      |
| 10 | driver | 08012345679   | 012345 | Musa Abdullahi    | Kano          |

### 🔐 Login Testing Examples

**Admin Login:**
on
{
  "phoneNumber": "08012345670",
  "pin": "123456"
}

**Seller Login:**
on
{
  "phoneNumber": "08012345671",
  "pin": "234567"
}

**Buyer Login:**
on
{
  "phoneNumber": "08012345673",
  "pin": "456789"
}

**Driver Login:**
on
{
  "phoneNumber": "08012345675",
  "pin": "678901"
}

### 📝 Testing Scenarios

1. **Admin User (ID: 1):**
   - Can access admin dashboard
   - Can verify products
   - Can view all system activity

2. **Sellers (IDs: 2, 3, 8):**
   - Can list products
   - Can manage their product inventory
   - Can view their orders

3. **Buyers (IDs: 4, 5, 9):**
   - Can browse products
   - Can place orders
   - Can approve deliveries

4. **Drivers (IDs: 6, 7, 10):**
   - Can view assigned delivery tasks
   - Can update delivery status
   - Can upload proof of delivery

---

## Troubleshooting

### Issue 1: "Access denied for user 'root'@'localhost'"

**Solution:**
bash
# Reset MySQL root password
mysql -u root

# In MySQL prompt:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;

Update your `.env` file with the new password.

---

### Issue 2: "Database 'maviram_db' doesn't exist"

**Solution:**
bash
mysql -u root -p -e "CREATE DATABASE maviram_db;"

Or run the setup endpoint again:
bash
curl -X POST http://localhost:3000/api/db/setup

---

### Issue 3: "Table 'users' doesn't exist"

**Solution:**
Re-run the database setup:
bash
curl -X POST http://localhost:3000/api/db/setup

Or manually create tables using [Method C](#method-c-manual-sql-commands).

---

### Issue 4: "Can't connect to MySQL server on 'localhost'"

**Possible Causes & Solutions:**

1. **MySQL service not running:**
   bash
   # Windows
   net start MySQL80
   
   # macOS
   brew services start mysql
   
   # Linux
   sudo systemctl start mysql
   
2. **Wrong port in DATABASE_URL:**
   bash
   # Check MySQL port
   mysql -u root -p -e "SHOW VARIABLES LIKE 'port';"
      Update `.env` if port is different from 3306.

3. **Firewall blocking connection:**
   - Windows: Allow MySQL through Windows Firewall
   - Linux: `sudo ufw allow 3306`

---

### Issue 5: "Connection limit exceeded"

**Solution:**
sql
-- Increase max connections
SET GLOBAL max_connections = 500;

-- Or edit my.cnf/my.ini:
[mysqld]
max_connections = 500

Restart MySQL server after changing configuration.

---

### Issue 6: Sample users not showing up

**Solution:**
bash
# Check if users table has data
mysql -u root -p -D maviram_db -e "SELECT COUNT(*) FROM users;"

If count is 0, re-insert sample data:
bash
curl -X POST http://localhost:3000/api/db/setup

---

### Issue 7: Foreign key constraint fails

**Solution:**
This happens when inserting data in wrong order.

sql
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables
DROP TABLE proof_of_delivery;
DROP TABLE delivery_tasks;
DROP TABLE order_items;
DROP TABLE orders;
DROP TABLE transactions;
DROP TABLE notifications;
DROP TABLE activity_logs;
DROP TABLE abandoned_processes;
DROP TABLE products;
DROP TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Then re-run setup

Or use the setup endpoint:
bash
curl -X POST http://localhost:3000/api/db/setup

---

### Issue 8: "Duplicate entry for key 'phone_number'"

**Solution:**
Phone numbers must be unique. If you're trying to insert duplicate data:

sql
-- Clear existing data
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE users;

-- Then re-insert sample data

---

### Quick Reset Command

If you need to completely reset the database:

bash
mysql -u root -p -e "DROP DATABASE IF EXISTS maviram_db; CREATE DATABASE maviram_db;"
curl -X POST http://localhost:3000/api/db/setup

---

## Support

If you encounter issues not covered here:

1. Check MySQL error logs:
   - Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
   - macOS: `/usr/local/var/mysql/*.err`
   - Linux: `/var/log/mysql/error.log`

2. Check Next.js console output for detailed error messages

3. Verify your `.env` file has correct credentials

4. Ensure MySQL service is running: `mysql -u root -p`

---

**🎉 Congratulations!** Your Maviram database is now set up and ready for development!

Next steps:
- Test authentication endpoints with sample user credentials
- Create products using seller accounts
- Place orders using buyer accounts
- Assign deliveries to driver accounts

Happy coding! 🚀