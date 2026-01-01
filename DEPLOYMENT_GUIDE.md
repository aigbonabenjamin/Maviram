# Maviram Food Delivery - Complete Deployment Guide

This guide provides step-by-step instructions for deploying the Maviram platform on either:
- **Option A:** Windows 11 with IIS (Internet Information Services)
- **Option B:** Ubuntu with Docker (Recommended for easier setup)

---

## Table of Contents

1. [Option A: Windows 11 + IIS Deployment](#option-a-windows-11--iis-deployment)
2. [Option B: Ubuntu + Docker Deployment](#option-b-ubuntu--docker-deployment-recommended)
3. [Testing Your Deployment](#testing-your-deployment)
4. [Troubleshooting](#troubleshooting)

---

# Option A: Windows 11 + IIS Deployment

## Prerequisites

- Windows 11 Pro or Enterprise
- Administrator access
- At least 8GB RAM
- 20GB free disk space

## Step 1: Install Required Software

### 1.1 Install Node.js

1. **Download Node.js:**
   - Go to https://nodejs.org/
   - Download the **LTS version** (currently v20.x)
   - Choose the **Windows Installer (.msi)** for 64-bit

2. **Install Node.js:**
   - Run the downloaded installer
   - Accept the license agreement
   - **Important:** Check the box "Automatically install necessary tools"
   - Click "Next" through all prompts
   - Click "Install" and wait for completion

3. **Verify Installation:**
   - Open **Command Prompt** (Windows key + R, type `cmd`, press Enter)
   - Run these commands:
   ```cmd
   node --version
   npm --version
   ```
   - You should see version numbers (e.g., v20.10.0 and 10.2.3)

### 1.2 Install MySQL Server

1. **Download MySQL:**
   - Go to https://dev.mysql.com/downloads/mysql/
   - Click "**Go to Download Page**" under "Windows (x86, 64-bit), ZIP Archive"
   - Click "**No thanks, just start my download**"

2. **Install MySQL:**
   - Run the installer (`mysql-installer-community-8.x.x.msi`)
   - Choose "**Custom**" installation type
   - Select these components:
     - MySQL Server 8.x
     - MySQL Workbench 8.x
     - MySQL Shell
     - Connector/ODBC
   - Click "Next" and then "Execute" to install

3. **Configure MySQL:**
   - **Type and Networking:**
     - Config Type: Development Computer
     - Port: 3306 (default)
     - Open Windows Firewall port: ✓ Checked
   - **Authentication:**
     - Use Legacy Authentication Method (recommended for compatibility)
   - **Accounts and Roles:**
     - Root Password: Create a strong password (e.g., `MySecurePass123!`)
     - **Write this down - you'll need it!**
     - Leave "Create New User" unchecked for now
   - Click "Execute" to apply configuration

4. **Verify MySQL Installation:**
   ```cmd
   mysql --version
   ```

### 1.3 Install IIS and Required Features

1. **Open PowerShell as Administrator:**
   - Press Windows key
   - Type "PowerShell"
   - Right-click "Windows PowerShell"
   - Click "Run as administrator"

2. **Enable IIS and Required Features:**
   ```powershell
   # Enable IIS
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-ApplicationDevelopment
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-NetFxExtensibility45
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-HealthAndDiagnostics
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-Security
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-Performance
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerManagementTools
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-ManagementConsole
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-DefaultDocument
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-DirectoryBrowsing
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebSockets
   ```

3. **Restart your computer** after installation completes

4. **Verify IIS Installation:**
   - Open a web browser
   - Go to `http://localhost`
   - You should see the IIS welcome page

### 1.4 Install IIS Node

IIS Node allows Node.js applications to run on IIS.

1. **Download IIS Node:**
   - Go to https://github.com/Azure/iisnode/releases
   - Download the latest `iisnode-full-v0.2.xx-x64.msi`

2. **Install IIS Node:**
   - Run the downloaded installer
   - Accept the license agreement
   - Use default installation path
   - Click "Install"

3. **Verify Installation:**
   - Open IIS Manager (Windows key, type "IIS", press Enter)
   - Click on your server name on the left
   - You should see "iisnode" icon in the middle pane

### 1.5 Install URL Rewrite Module

1. **Download URL Rewrite:**
   - Go to https://www.iis.net/downloads/microsoft/url-rewrite
   - Click "Install this extension"
   - Or download directly: https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi

2. **Install URL Rewrite:**
   - Run the installer
   - Accept terms and click "Install"

## Step 2: Set Up the Database

### 2.1 Create Database

1. **Open MySQL Workbench:**
   - Start Menu → MySQL Workbench

2. **Connect to MySQL:**
   - Click on "Local instance MySQL80"
   - Enter your root password

3. **Create Database:**
   - Click "Create a new schema" button (cylinder with plus icon)
   - Name: `dbMaviram`
   - Charset: `utf8mb4`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Apply"

### 2.2 Create Application User

Run these SQL commands in MySQL Workbench:

```sql
-- Create a user for the application
CREATE USER 'maviram_user'@'localhost' IDENTIFIED BY 'Maviram2024!Secure';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON dbMaviram.* TO 'maviram_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

**Write down these credentials:**
- Username: `maviram_user`
- Password: `Maviram2024!Secure`

### 2.3 Import Database Schema

1. **Open your project folder** in File Explorer
2. **Locate** the `MYSQL_SETUP.sql` file
3. **In MySQL Workbench:**
   - Go to File → Open SQL Script
   - Select `MYSQL_SETUP.sql`
   - Click "Execute" (lightning bolt icon)
   - Wait for completion

## Step 3: Prepare Your Application

### 3.1 Build the Application

1. **Open Command Prompt as Administrator:**
   - Windows key → type `cmd`
   - Right-click "Command Prompt"
   - Click "Run as administrator"

2. **Navigate to your project:**
   ```cmd
   cd C:\path\to\your\maviram-project
   ```

3. **Install dependencies:**
   ```cmd
   npm install
   ```

4. **Create production environment file:**
   ```cmd
   copy .env .env.production
   ```

5. **Edit `.env.production`:**
   - Open with Notepad: `notepad .env.production`
   - Update with these values:
   ```env
   # Database Configuration
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=maviram_user
   MYSQL_PASSWORD=Maviram2024!Secure
   MYSQL_DATABASE=dbMaviram
   DATABASE_URL=mysql://maviram_user:Maviram2024!Secure@localhost:3306/dbMaviram

   # Application Configuration
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

6. **Build the application:**
   ```cmd
   npm run build
   ```
   This will take a few minutes. Wait until you see "Build completed successfully"

### 3.2 Test Production Build Locally

Before deploying to IIS, test the build:

```cmd
npm run start
```

- Open browser to `http://localhost:3000`
- Test login functionality
- If everything works, press `Ctrl+C` to stop the server

## Step 4: Deploy to IIS

### 4.1 Create IIS Site Directory

1. **Create deployment folder:**
   ```cmd
   mkdir C:\inetpub\wwwroot\maviram
   ```

2. **Copy application files:**
   ```cmd
   xcopy /E /I /Y "C:\path\to\your\maviram-project" "C:\inetpub\wwwroot\maviram"
   ```

### 4.2 Create IIS Site

1. **Open IIS Manager:**
   - Windows key → type "IIS" → press Enter

2. **Create Application Pool:**
   - Right-click "Application Pools"
   - Click "Add Application Pool"
   - Name: `MaviramAppPool`
   - .NET CLR version: "No Managed Code"
   - Managed pipeline mode: Integrated
   - Click "OK"

3. **Configure Application Pool:**
   - Click "Application Pools" in left pane
   - Right-click "MaviramAppPool"
   - Click "Advanced Settings"
   - Under "Process Model" → Identity: ApplicationPoolIdentity
   - Under "General" → Start Mode: AlwaysRunning
   - Click "OK"

4. **Create Website:**
   - Right-click "Sites" in left pane
   - Click "Add Website"
   - **Site name:** Maviram
   - **Application pool:** MaviramAppPool
   - **Physical path:** `C:\inetpub\wwwroot\maviram`
   - **Binding:**
     - Type: http
     - IP address: All Unassigned
     - Port: 80
     - Host name: (leave empty for localhost access)
   - Click "OK"

### 4.3 Configure IIS for Node.js

1. **Create web.config in application folder:**
   - Open Notepad as administrator
   - Copy this content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>

    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>

        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>

        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>

    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>

    <httpErrors existingResponse="PassThrough" />

    <iisnode
      node_env="production"
      nodeProcessCountPerApplication="1"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
      maxNamedPipeConnectionPoolSize="512"
      maxNamedPipePooledConnectionAge="30000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      watchedFiles="*.js;iisnode.yml"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      loggingEnabled="true"
      logDirectory="iisnode"
      debuggingEnabled="false"
      debugHeaderEnabled="false"
      debuggerPortRange="5058-6058"
      debuggerPathSegment="debug"
      maxLogFileSizeInKB="128"
      maxTotalLogFileSizeInKB="1024"
      maxLogFiles="20"
      devErrorsEnabled="false"
      flushResponse="false"
      enableXFF="false"
      promoteServerVars=""
      configOverrides="iisnode.yml"
    />
  </system.webServer>
</configuration>
```

   - Save as: `C:\inetpub\wwwroot\maviram\web.config`

2. **Create server.js entry point:**
   - Open Notepad as administrator
   - Copy this content:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

   - Save as: `C:\inetpub\wwwroot\maviram\server.js`

### 4.4 Set Permissions

1. **Open Command Prompt as Administrator:**

```cmd
icacls "C:\inetpub\wwwroot\maviram" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\wwwroot\maviram" /grant "IUSR:(OI)(CI)F" /T
icacls "C:\inetpub\wwwroot\maviram\.next" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

### 4.5 Start the Site

1. **In IIS Manager:**
   - Click "Sites" in left pane
   - Click "Maviram"
   - Click "Start" in right pane (if not already started)

2. **Test the deployment:**
   - Open browser
   - Go to `http://localhost`
   - Your Maviram application should load!

## Step 5: Configure Firewall for Network Access

To allow other computers on your network to access the site:

1. **Open Windows Defender Firewall:**
   - Windows key → type "Windows Defender Firewall"

2. **Create Inbound Rule:**
   - Click "Advanced settings"
   - Click "Inbound Rules"
   - Click "New Rule"
   - Rule Type: Port
   - Protocol: TCP
   - Specific local ports: 80
   - Action: Allow the connection
   - Profile: Check all (Domain, Private, Public)
   - Name: Maviram IIS Website
   - Click "Finish"

3. **Find your local IP address:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (usually starts with 192.168.x.x)

4. **Access from other devices:**
   - On another computer/phone on the same network
   - Go to `http://YOUR_IP_ADDRESS` (e.g., `http://192.168.1.100`)

---

# Option B: Ubuntu + Docker Deployment (RECOMMENDED)

This method is easier and more reliable than IIS deployment.

## Prerequisites

- Ubuntu 20.04 LTS or newer (or Ubuntu on WSL2 for Windows)
- At least 4GB RAM
- 20GB free disk space

## Step 1: Install Docker

### 1.1 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Docker

```bash
# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (no sudo needed)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

### 1.3 Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Step 2: Prepare Your Application

### 2.1 Create Project Directory

```bash
# Create project directory
mkdir -p ~/maviram
cd ~/maviram

# If you have the project files, copy them here
# Otherwise, clone from git:
# git clone <your-repo-url> .
```

### 2.2 Create Dockerfile

Create a file named `Dockerfile`:

```bash
nano Dockerfile
```

Add this content:

```dockerfile
# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build application
RUN npm run build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Save and exit (Ctrl+X, Y, Enter)

### 2.3 Update next.config.ts

Edit your Next.js configuration:

```bash
nano next.config.ts
```

Add `output: 'standalone'`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Add this line
  // ... rest of your config
};

export default nextConfig;
```

### 2.4 Create Docker Compose File

Create `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Add this content:

```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: maviram-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: RootPass123!Secure
      MYSQL_DATABASE: dbMaviram
      MYSQL_USER: maviram_user
      MYSQL_PASSWORD: Maviram2024!Secure
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./MYSQL_SETUP.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - maviram-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  # Next.js Application
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: maviram-web
    restart: always
    ports:
      - "3000:3000"
    environment:
      # Database Configuration
      MYSQL_HOST: mysql
      MYSQL_PORT: 3306
      MYSQL_USER: maviram_user
      MYSQL_PASSWORD: Maviram2024!Secure
      MYSQL_DATABASE: dbMaviram
      DATABASE_URL: mysql://maviram_user:Maviram2024!Secure@mysql:3306/dbMaviram
      
      # Application Configuration
      NODE_ENV: production
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - maviram-network

volumes:
  mysql_data:

networks:
  maviram-network:
    driver: bridge
```

Save and exit.

### 2.5 Create .dockerignore

```bash
nano .dockerignore
```

Add this content:

```
node_modules
.next
.git
.gitignore
*.md
.env
.env.local
.env.development
.env.production
npm-debug.log
yarn-error.log
.DS_Store
```

## Step 3: Build and Run

### 3.1 Build Docker Images

```bash
docker-compose build
```

This will take 5-10 minutes the first time.

### 3.2 Start Services

```bash
docker-compose up -d
```

The `-d` flag runs containers in the background.

### 3.3 Check Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f web
docker-compose logs -f mysql
```

Press `Ctrl+C` to stop viewing logs.

## Step 4: Access Your Application

### 4.1 From Local Machine

Open browser to: `http://localhost:3000`

### 4.2 From Network

1. **Find your Ubuntu server's IP:**
   ```bash
   hostname -I
   ```

2. **Access from other devices:**
   - Go to `http://YOUR_SERVER_IP:3000`

### 4.3 Configure Firewall (if needed)

```bash
# Allow port 3000
sudo ufw allow 3000/tcp

# Enable firewall if not already enabled
sudo ufw enable

# Check status
sudo ufw status
```

## Step 5: Useful Docker Commands

### Start/Stop Services

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f mysql
```

### Database Access

```bash
# Access MySQL shell
docker exec -it maviram-mysql mysql -u maviram_user -p

# Backup database
docker exec maviram-mysql mysqldump -u maviram_user -pMaviram2024!Secure dbMaviram > backup.sql

# Restore database
docker exec -i maviram-mysql mysql -u maviram_user -pMaviram2024!Secure dbMaviram < backup.sql
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

---

# Testing Your Deployment

## Test Checklist

Regardless of which deployment method you used, verify these:

### 1. Home Page
- [ ] Navigate to `http://localhost` or `http://localhost:3000`
- [ ] Verify the Maviram landing page loads
- [ ] Check all images and styles load correctly

### 2. Database Connection
- [ ] Go to Database Viewer page
- [ ] Verify users are displayed
- [ ] Check for any error messages

### 3. Authentication
Test with these default accounts:

**Admin:**
- Phone: `08012345671`
- PIN: `1111`

**Seller:**
- Phone: `08012345672`
- PIN: `1111`

**Buyer:**
- Phone: `08012345677`
- PIN: `1111`

**Driver:**
- Phone: `08012345682`
- PIN: `1111`

### 4. API Endpoints
- [ ] Go to `http://localhost:3000/api-docs`
- [ ] Test a few API endpoints
- [ ] Verify responses are correct

### 5. Role-Based Access
- [ ] Login as Admin → Should redirect to `/admin/dashboard`
- [ ] Login as Seller → Should redirect to `/seller/products`
- [ ] Login as Buyer → Should redirect to `/buyer/marketplace`
- [ ] Login as Driver → Should redirect to `/driver/tasks`

---

# Troubleshooting

## Windows IIS Issues

### "500 Internal Server Error"

**Check IIS Node logs:**
```
C:\inetpub\wwwroot\maviram\iisnode\
```

**Common fixes:**
1. Verify Node.js is in system PATH
2. Check permissions: `icacls "C:\inetpub\wwwroot\maviram" /grant "IIS_IUSRS:(OI)(CI)F" /T`
3. Restart IIS: `iisreset /restart`

### "Database connection failed"

1. **Verify MySQL is running:**
   ```cmd
   net start MySQL80
   ```

2. **Test connection:**
   ```cmd
   mysql -u maviram_user -p -e "SELECT 1"
   ```

3. **Check `.env.production` has correct credentials**

### Site won't start

1. **Check Application Pool is running:**
   - Open IIS Manager
   - Click "Application Pools"
   - Verify "MaviramAppPool" is "Started"

2. **Recycle Application Pool:**
   - Right-click "MaviramAppPool"
   - Click "Recycle"

### Port already in use

1. **Find what's using port 80:**
   ```cmd
   netstat -ano | findstr :80
   ```

2. **Kill the process** or **change IIS site binding** to different port (e.g., 8080)

## Docker Issues

### Cannot connect to Docker daemon

```bash
# Start Docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
```

### Container fails to start

```bash
# View detailed logs
docker-compose logs web

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

### Database connection refused

```bash
# Check MySQL is healthy
docker-compose ps mysql

# View MySQL logs
docker-compose logs mysql

# Wait for MySQL to be ready (can take 30-60 seconds)
docker-compose logs -f mysql
# Wait for "ready for connections"
```

### Port already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
# Change "3000:3000" to "8080:3000"
```

### Out of disk space

```bash
# Remove unused images and containers
docker system prune -a

# Remove volumes (WARNING: deletes database!)
docker-compose down -v
```

## General Issues

### Application loads but shows errors

1. **Check browser console** (F12)
2. **Verify environment variables** are set correctly
3. **Check database** has data (run seeders if empty)

### Can't access from other devices

**Windows IIS:**
- Check Windows Firewall allows port 80
- Find your IP: `ipconfig`
- Access from other device: `http://YOUR_IP`

**Docker/Ubuntu:**
- Check UFW firewall: `sudo ufw allow 3000/tcp`
- Find your IP: `hostname -I`
- Access from other device: `http://YOUR_IP:3000`

### Performance is slow

**Windows IIS:**
- Increase Application Pool memory limit
- Enable compression in IIS
- Check antivirus isn't scanning web folder

**Docker:**
- Allocate more resources to Docker
- Check disk space: `df -h`
- Optimize MySQL: Add index, increase buffer pool

---

# Next Steps

## After Successful Deployment

1. **Change default passwords/PINs** for security
2. **Set up SSL/HTTPS** for production use
3. **Configure backups** for database
4. **Set up monitoring** (logs, uptime)
5. **Document your custom changes**

## Production Deployment

For internet-facing production deployment, consider:

1. **Cloud Hosting:** AWS, DigitalOcean, Azure
2. **Managed Database:** AWS RDS, PlanetScale
3. **CDN:** Cloudflare for static assets
4. **SSL Certificate:** Let's Encrypt (free)
5. **Domain Name:** Register a custom domain

---

# Getting Help

If you encounter issues:

1. **Check logs** (IIS logs or Docker logs)
2. **Review error messages** carefully
3. **Search error messages** online
4. **Check application `/api-docs`** for API issues
5. **Verify database** connection and data

---

**Maviram - We make it happen! 🚚🌾**

*Documentation Version 1.0 - Last Updated: 2025*