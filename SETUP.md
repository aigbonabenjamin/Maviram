# Maviram Food Delivery Platform - Local Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **bun** (package manager)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd maviram-food-delivery
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using bun:
```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=dbMaviram
DATABASE_URL=mysql://your_mysql_user:your_mysql_password@localhost:3306/dbMaviram

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Add any additional environment variables here
```

### 4. Set Up MySQL Database

#### Option A: Create Database Manually

1. Open MySQL command line or MySQL Workbench:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE dbMaviram;
USE dbMaviram;
```

3. Exit MySQL:
```sql
EXIT;
```

#### Option B: Use Database Migration Script

The project includes database schema and stored procedures. Run the setup script:

```bash
# First, make sure your MySQL credentials in .env are correct
npm run db:setup
```

### 5. Run Database Migrations

Apply database schema and create tables:

```bash
npx drizzle-kit push
```

### 6. Seed the Database (Optional)

Populate the database with test data:

```bash
npm run db:seed
```

This will create:
- **2 Admin users**
- **5 Sellers** (with Nigerian agricultural products)
- **5 Buyers**
- **3 Drivers**
- **18 Products** (Maize, Rice, Beans, etc.)
- **12 Sample Orders**
- **Delivery Tasks, Notifications, and Transactions**

### 7. Start the Development Server

```bash
npm run dev
```

Or with bun:
```bash
bun dev
```

The application will be available at: **http://localhost:3000**

## 🔐 Default Test Accounts

After seeding, you can log in with these test accounts:

### Admin
- **Phone:** `08012345671`
- **PIN:** `1111`

### Seller
- **Phone:** `08012345672`
- **PIN:** `1111`

### Buyer
- **Phone:** `08012345677`
- **PIN:** `1111`

### Driver
- **Phone:** `08012345682`
- **PIN:** `1111`

## 📁 Project Structure

```
maviram-food-delivery/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── buyer/             # Buyer marketplace
│   │   ├── seller/            # Seller product management
│   │   ├── driver/            # Driver task management
│   │   ├── api/               # API routes
│   │   ├── login/             # Authentication pages
│   │   └── register/
│   ├── components/            # Reusable React components
│   │   └── ui/               # UI components (shadcn/ui)
│   ├── db/                    # Database configuration
│   │   ├── schema.ts         # Database schema
│   │   └── seeds/            # Database seeders
│   ├── lib/                   # Utility functions
│   │   └── contexts/         # React contexts (Auth, etc.)
│   └── hooks/                 # Custom React hooks
├── public/                    # Static assets
├── .env                       # Environment variables
├── drizzle.config.ts         # Drizzle ORM configuration
└── package.json              # Dependencies and scripts
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes to database
npm run db:seed         # Seed database with test data
npm run db:studio       # Open Drizzle Studio (database GUI)

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking
```

## 📚 API Documentation

Once the server is running, access the API documentation at:

**http://localhost:3000/api-docs**

The documentation includes:
- All available endpoints
- Request/response schemas
- Interactive testing interface
- Example requests and responses

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with phone & PIN
- `POST /api/auth/register` - Register new user

#### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user

#### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PATCH /api/products/[id]/status` - Update status

#### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/[id]/status` - Update order status

#### Delivery Tasks
- `GET /api/delivery-tasks` - List tasks
- `POST /api/delivery-tasks` - Create task

#### Proof of Delivery
- `GET /api/proof-of-delivery` - List/filter proofs
- `POST /api/proof-of-delivery` - Create proof

## 🎯 User Roles & Features

### Admin
- Order tracking and management
- Driver management
- Transaction logs
- User management
- Platform analytics

### Seller
- Product listing (CRUD operations)
- Inventory management
- Order status updates
- Sales tracking

### Buyer
- Product browsing
- Shopping cart
- Order placement
- Order tracking
- Delivery confirmation

### Driver
- Task assignment
- Pickup verification
- Delivery confirmation
- Electronic Proof of Delivery (e-POD)

## 🐛 Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Verify MySQL is running:
```bash
# On Linux/Mac
sudo systemctl status mysql

# On Windows
net start MySQL80
```

2. Check your `.env` credentials match your MySQL setup

3. Ensure the `dbMaviram` database exists:
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Module Not Found Errors

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Schema Issues

Reset and reapply schema:

```bash
npx drizzle-kit drop    # ⚠️ This will delete all data
npx drizzle-kit push
npm run db:seed
```

## 🔒 Security Notes

- **Change default PINs** in production
- **Never commit `.env`** file to version control
- Use **strong passwords** for MySQL
- Enable **SSL/TLS** for database connections in production
- Implement **rate limiting** for API endpoints

## 🌐 Deployment

### Production Checklist

- [ ] Update environment variables for production
- [ ] Set up production MySQL database
- [ ] Configure proper authentication secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up backup strategy
- [ ] Configure monitoring and logging
- [ ] Review and update CORS settings
- [ ] Optimize database indexes

### Recommended Hosting

- **Frontend & API:** Vercel, Netlify, or Railway
- **Database:** AWS RDS, PlanetScale, or DigitalOcean
- **File Storage:** AWS S3, Cloudinary, or Supabase Storage

## 📞 Support

For issues or questions:

1. Check existing GitHub issues
2. Review API documentation at `/api-docs`
3. Check database logs in MySQL
4. Review browser console for frontend errors

## 📄 License

[Your License Here]

---

**Maviram** - *We make it happen* 🚚🌾