# TODO: Remove Docker and Run App/Database Locally

## Step 1: Remove Docker-related files
- [x] Delete docker-compose.yml
- [x] Delete Dockerfile

## Step 2: Install local dependencies
- [ ] Install MySQL 8.0+ on Windows (if not already installed) - Download from https://dev.mysql.com/downloads/mysql/
- [ ] Install Redis on Windows (if not already installed) - Download from https://redis.io/download
- [ ] Start MySQL service
- [ ] Start Redis service

## Step 3: Configure environment
- [ ] Verify .env file exists with correct local settings:
  - MYSQL_HOST=localhost
  - MYSQL_USER=your_mysql_user
  - MYSQL_PASSWORD=your_mysql_password
  - MYSQL_DATABASE=maviram
  - REDIS_URL=redis://localhost:6379
  - Other required env vars

## Step 4: Set up database
- [ ] Create MySQL database 'maviram'
- [ ] Run database migrations: `npx drizzle-kit push`
- [ ] Seed database with test data: `npm run db:seed`

## Step 5: Start the application
- [ ] Install dependencies: `npm install`
- [ ] Start development server: `npm run dev`
- [ ] Verify app runs at http://localhost:3000
- [ ] Test database connection and Redis caching
