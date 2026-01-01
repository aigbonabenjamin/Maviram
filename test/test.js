// test/test.js
// CHANGE: Make sure this file is in your 'test' folder

// At the very top of test/test.js
require('dotenv').config({ path: '.env.test' });

// Import mysql2 with promise support for async/await syntax
const mysql = require('mysql2/promise');

// Import dotenv to load environment variables from .env files
const dotenv = require('dotenv');

// Load .env.test file BEFORE running tests
// CHANGE: Make sure you have a .env.test file in your project root
const result = dotenv.config({ path: '.env.test' });

// Check if .env.test was loaded successfully
if (result.error) {
  console.error('⚠️  WARNING: .env.test file not found! Creating default connection...');
  console.error('Please create a .env.test file in your project root');
}

// Jest test suite - groups related tests together
describe('Database Connection Tests', () => {
  
  // Variable to store database connection
  let connection;
  
  // Variable to store connection configuration
  let dbConfig;

  // beforeAll runs once before all tests in this suite
  beforeAll(async () => {
    
    // Build database configuration from environment variables
    // CHANGE: Set these values in your .env.test file
    dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '12345',
      database: process.env.DB_NAME || 'maviram_test',
      port: parseInt(process.env.DB_PORT || '3306')
    };
    
    // Log the configuration being used (without password for security)
    console.log('📋 Database Configuration:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Port: ${dbConfig.port}`);
    
    try {
      // Create a connection to MySQL database
      connection = await mysql.createConnection(dbConfig);
      console.log('✅ Database connection established successfully');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      throw error;
    }
  });

  // afterAll runs once after all tests complete
  afterAll(async () => {
    
    // Check if connection exists
    if (connection) {
      
      // Close the database connection to prevent memory leaks
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  });

  // First test: Check if database connection works
  test('should connect to the database successfully', async () => {
    
    // Verify connection object was created
    expect(connection).toBeDefined();
    
    // Execute a simple math query to verify connection is active
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    
    // Check if query returned the correct result (2)
    expect(rows[0].result).toBe(2);
  });

  // Second test: Verify the database exists in MySQL
  test('should verify database exists', async () => {
    
    // Query MySQL system tables to check if our database exists
    const [rows] = await connection.query(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbConfig.database]
    );
    
    // If database doesn't exist, log helpful message
    if (rows.length === 0) {
      console.error(`❌ Database '${dbConfig.database}' does not exist!`);
      console.error(`   Run this SQL command to create it:`);
      console.error(`   CREATE DATABASE ${dbConfig.database};`);
    }
    
    // Expect at least one row (our database) to be returned
    expect(rows.length).toBeGreaterThan(0);
  });

  // Third test: Ensure all required environment variables are set
  test('should have correct database configuration', () => {
    
    // Log all environment variables for debugging
    console.log('🔍 Checking environment variables:');
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'NOT SET (using default)'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || 'NOT SET (using default)'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'NOT SET (using default)'}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT || 'NOT SET (using default)'}`);
    
    // Check that DB_HOST environment variable is defined
    expect(process.env.DB_HOST).toBeDefined();
    
    // Check that DB_USER environment variable is defined
    expect(process.env.DB_USER).toBeDefined();
    
    // Check that DB_NAME environment variable is defined
    expect(process.env.DB_NAME).toBeDefined();
  });

  // Fourth test: Execute a basic query to list tables
  test('should be able to perform a simple query', async () => {
    
    // Query to get all tables in the current database
    const [rows] = await connection.query('SHOW TABLES');
    
    // Log how many tables were found
    console.log(`📊 Found ${rows.length} table(s) in database '${dbConfig.database}'`);
    
    // Verify that the result is an array (even if empty)
    expect(Array.isArray(rows)).toBe(true);
  });
});