import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Create database if it doesn't exist
await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
await connection.changeUser({ database: process.env.DB_NAME });

// Create users table if not exists
await connection.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create user_profiles table if not exists
await connection.query(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100),
    age INT,
    gender VARCHAR(10),
    weight FLOAT,
    height FLOAT,
    bmi FLOAT,
    health_conditions TEXT,
    dietary_restrictions TEXT,
    allergies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

console.log("✅ Connected to MySQL and ensured all tables exist!");

export default connection;
