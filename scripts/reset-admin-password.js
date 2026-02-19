// Reset admin password to match .env
import pool from '../src/config/database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function resetPassword() {
  try {
    const adminUsername = process.env.ADMIN_USER || 'admin';
    const adminPassword = process.env.ADMIN_PASS || 'admin123';
    
    console.log(`🔐 Resetting password for user: ${adminUsername}\n`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Update the user
    const [result] = await pool.query(
      'UPDATE Users SET PasswordHash = ? WHERE Email = ? OR Name = ?',
      [hashedPassword, adminUsername, adminUsername]
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Password reset successfully!\n');
      console.log('Login credentials:');
      console.log(`  Username: ${adminUsername}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(`\nYou can now log in at: http://localhost:3000/admin/login\n`);
    } else {
      console.log(`❌ User "${adminUsername}" not found in database\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();
