// Check Users table and create admin user if needed
import pool from '../src/config/database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function setupAdmin() {
  try {
    console.log('🔍 Checking Users table...\n');
    
    // Check if Users table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'Users'");
    
    if (tables.length === 0) {
      console.log('❌ Users table does not exist. Creating it...');
      await pool.query(`
        CREATE TABLE Users (
          UserID INT AUTO_INCREMENT PRIMARY KEY,
          Email VARCHAR(100) NOT NULL UNIQUE,
          PasswordHash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Users table created\n');
    } else {
      console.log('✅ Users table exists\n');
    }
    
    // Check if admin user exists
    const adminUsername = process.env.ADMIN_USER || 'admin';
    const [users] = await pool.query('SELECT * FROM Users WHERE Email = ?', [adminUsername]);
    
    if (users.length === 0) {
      console.log(`📝 Creating admin user: ${adminUsername}`);
      const adminPassword = process.env.ADMIN_PASS || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await pool.query(
        'INSERT INTO Users (Email, PasswordHash, role) VALUES (?, ?, ?)',
        [adminUsername, hashedPassword, 'admin']
      );
      
      console.log('✅ Admin user created successfully\n');
      console.log('Login credentials:');
      console.log(`  Username: ${adminUsername}`);
      console.log(`  Password: ${adminPassword}\n`);
    } else {
      console.log(`✅ Admin user "${adminUsername}" already exists\n`);
      console.log('If you need to reset the password, delete the user and run this script again.\n');
    }
    
    // Show all users
    const [allUsers] = await pool.query('SELECT UserID, Email, role FROM Users');
    console.log('Current users in database:');
    allUsers.forEach(user => {
      console.log(`  - ${user.Email} (${user.role}) - ID: ${user.UserID}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

setupAdmin();
