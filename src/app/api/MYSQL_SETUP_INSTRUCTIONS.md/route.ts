# MySQL Database Setup Instructions

## Prerequisites

Before starting the database setup, ensure you have the following:

### 1. MySQL Installation
- MySQL Server 8.0 or higher installed and running
- MySQL client tools (mysql command-line or MySQL Workbench)

### 2. Environment Configuration
Verify your `.env` file contains the following MySQL credentials:

env
DATABASE_URL=mysql://username:password@localhost:3306/farmlink_db
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=farmlink_db
DB_PORT=3306

### 3. Required Node Packages
Ensure these packages are installed in your project:

bash
npm install drizzle-orm mysql2 dotenv
npm install -D drizzle-kit @types/node

## Configuration Files Updated

The following files have been reconfigured for MySQL:

### 1. `drizzle.config.ts`
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farmlink_db',
    port: parseInt(process.env.DB_PORT || '3306'),
  },
} satisfies Config;

### 2. `src/db/index.ts`
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farmlink_db',
  port: parseInt(process.env.DB_PORT || '3306'),
});

export const db = drizzle(connection);

### 3. `src/db/schema.ts`
Updated to use MySQL-specific types:
- `mysqlTable` instead of `sqliteTable`
- `int` instead of `integer`
- `text` for string fields
- `timestamp` with MySQL-specific defaults
- `tinyint` for boolean values
- `.autoincrement()` for auto-incrementing primary keys
- `.defaultNow()` and `.onUpdateNow()` for timestamps

## Step-by-Step Setup Instructions

### Step 1: Start MySQL Server

**For macOS/Linux:**
bash
sudo systemctl start mysql
# or
sudo service mysql start

**For Windows:**
bash
net start MySQL80

**Verify MySQL is running:**
bash
mysql --version
sudo systemctl status mysql

### Step 2: Create Database

Log into MySQL as root:
bash
mysql -u root -p

Create the database:
sql
CREATE DATABASE IF NOT EXISTS farmlink_db;
USE farmlink_db;
EXIT;

### Step 3: Generate Migration Files

Generate SQL migration files from your schema:
bash
npx drizzle-kit generate:mysql

This creates migration files in the `drizzle` folder.

### Step 4: Push Schema to Database

Apply the schema to your MySQL database:
bash
npx drizzle-kit push:mysql

**Alternative: Run migrations manually:**
bash
npx drizzle-kit migrate

### Step 5: Verify Tables Created

Log back into MySQL and verify:
bash
mysql -u root -p farmlink_db

sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE products;
DESCRIBE orders;
DESCRIBE order_items;
DESCRIBE delivery_tasks;
DESCRIBE proof_of_delivery;
DESCRIBE transactions;
DESCRIBE notifications;
DESCRIBE activity_logs;
DESCRIBE abandoned_processes;
EXIT;

### Step 6: Run Seeders (If Available)

If you have seed files, run them in this order:

bash
# Seed users first (no dependencies)
node src/db/seeds/users.seed.js

# Seed products (depends on users)
node src/db/seeds/products.seed.js

# Seed orders (depends on users)
node src/db/seeds/orders.seed.js

# Seed order items (depends on orders and products)
node src/db/seeds/order-items.seed.js

# Seed delivery tasks (depends on orders and users)
node src/db/seeds/delivery-tasks.seed.js

# Seed remaining tables
node src/db/seeds/transactions.seed.js
node src/db/seeds/notifications.seed.js
node src/db/seeds/activity-logs.seed.js

### Step 7: Test Database Connection

Create a test script `test-connection.js`:
import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';

async function testConnection() {
  try {
    const result = await db.select().from(users).limit(1);
    console.log('✅ Database connection successful!');
    console.log('Sample data:', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
  process.exit(0);
}

testConnection();

Run the test:
bash
node test-connection.js

## Commands Reference

### MySQL Server Commands

bash
# Start MySQL
sudo systemctl start mysql        # Linux
brew services start mysql         # macOS with Homebrew
net start MySQL80                 # Windows

# Stop MySQL
sudo systemctl stop mysql
brew services stop mysql
net stop MySQL80

# Restart MySQL
sudo systemctl restart mysql
brew services restart mysql
net stop MySQL80 && net start MySQL80

# Check MySQL status
sudo systemctl status mysql
brew services list
sc query MySQL80

### Database Management Commands

bash
# Login to MySQL
mysql -u root -p

# Login to specific database
mysql -u root -p farmlink_db

# Create database
mysql -u root -p -e "CREATE DATABASE farmlink_db;"

# Drop database (⚠️ CAUTION)
mysql -u root -p -e "DROP DATABASE farmlink_db;"

# Import SQL file
mysql -u root -p farmlink_db < backup.sql

# Export database
mysqldump -u root -p farmlink_db > backup.sql

### NPM/Drizzle Commands

bash
# Generate migrations
npx drizzle-kit generate:mysql

# Push schema directly to database
npx drizzle-kit push:mysql

# Run migrations
npx drizzle-kit migrate

# Open Drizzle Studio (database browser)
npx drizzle-kit studio

# Check migration status
npx drizzle-kit check

### Development Commands

bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

## Verification Steps

### 1. Check Tables Were Created

bash
mysql -u root -p farmlink_db -e "SHOW TABLES;"

Expected output:
+-------------------------+
| Tables_in_farmlink_db   |
+-------------------------+
| abandoned_processes     |
| activity_logs           |
| delivery_tasks          |
| notifications           |
| order_items             |
| orders                  |
| products                |
| proof_of_delivery       |
| transactions            |
| users                   |
+-------------------------+

### 2. Verify Table Structure

bash
mysql -u root -p farmlink_db -e "DESCRIBE users;"

Check that columns match the schema definition.

### 3. Verify Data Was Seeded

bash
mysql -u root -p farmlink_db -e "SELECT COUNT(*) FROM users;"
mysql -u root -p farmlink_db -e "SELECT * FROM users LIMIT 5;"

### 4. Test API Endpoints

bash
# Test users endpoint
curl http://localhost:3000/api/users

# Test products endpoint
curl http://localhost:3000/api/products

# Test orders endpoint
curl http://localhost:3000/api/orders

# Create a test user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "role": "buyer",
    "phoneNumber": "+1234567890",
    "pin": "1234",
    "fullName": "Test User"
  }'

## Troubleshooting

### Connection Issues

**Error: "ER_ACCESS_DENIED_ERROR: Access denied for user"**

Solution:
bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

**Error: "ECONNREFUSED" or "Can't connect to MySQL server"**

Solution:
bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql

# Check MySQL is listening on correct port
sudo netstat -tlnp | grep 3306

**Error: "ER_BAD_DB_ERROR: Unknown database"**

Solution:
bash
# Create the database
mysql -u root -p -e "CREATE DATABASE farmlink_db;"

### Permission Issues

**Error: "ER_DBACCESS_DENIED_ERROR: Access denied for database"**

Solution:
sql
-- Grant all privileges to user
GRANT ALL PRIVILEGES ON farmlink_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;

-- Or create new user with privileges
CREATE USER 'farmlink_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON farmlink_db.* TO 'farmlink_user'@'localhost';
FLUSH PRIVILEGES;

### Schema/Migration Issues

**Error: "Table already exists"**

Solution:
bash
# Drop all tables and recreate
mysql -u root -p farmlink_db -e "DROP DATABASE farmlink_db; CREATE DATABASE farmlink_db;"
npx drizzle-kit push:mysql

**Error: Foreign key constraint fails**

Solution:
bash
# Disable foreign key checks temporarily
mysql -u root -p farmlink_db -e "SET FOREIGN_KEY_CHECKS=0;"
# Run your operations
mysql -u root -p farmlink_db -e "SET FOREIGN_KEY_CHECKS=1;"

### Package/Module Issues

**Error: "Cannot find module 'mysql2'"**

Solution:
bash
npm install mysql2

**Error: "drizzle-kit command not found"**

Solution:
bash
npm install -D drizzle-kit
# or run directly with npx
npx drizzle-kit --help

### Character Encoding Issues

**Error: Character encoding problems with special characters**

Solution:
sql
-- Set database to UTF-8
ALTER DATABASE farmlink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update table charset
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

### Performance Issues

**Issue: Slow queries**

Solution:
sql
-- Add indexes to frequently queried columns
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_delivery_driver ON delivery_tasks(driver_id);

-- Check slow query log
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';

### Backup and Recovery

**Create backup:**
bash
mysqldump -u root -p farmlink_db > farmlink_backup_$(date +%Y%m%d).sql

**Restore from backup:**
bash
mysql -u root -p farmlink_db < farmlink_backup_20240101.sql

### Common Environment Variable Issues

**Issue: Environment variables not loading**

Solution:
bash
# Verify .env file exists
ls -la .env

# Check .env is not in .gitignore (it should be)
cat .gitignore | grep .env

# Test environment loading
node -e "require('dotenv').config(); console.log(process.env.DB_NAME)"

## Additional Resources

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Drizzle ORM MySQL Docs**: https://orm.drizzle.team/docs/get-started-mysql
- **mysql2 Package**: https://github.com/sidorares/node-mysql2

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong passwords** for database users
3. **Create separate database users** for different environments
4. **Limit user privileges** - Only grant necessary permissions
5. **Enable SSL/TLS** for production database connections
6. **Regular backups** - Automate daily backups
7. **Update regularly** - Keep MySQL and packages up to date

## Next Steps

After successful setup:

1. Start your Next.js development server: `npm run dev`
2. Test all API endpoints
3. Verify data integrity
4. Set up automated backups
5. Configure monitoring and logging
6. Deploy to production environment