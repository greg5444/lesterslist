// src/db/seedAdmin.js
// Run this script to create the default admin user
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

async function seedAdmin() {
  try {
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS;
    
    if (!adminPass) {
      console.error('ERROR: ADMIN_PASS not found in .env');
      process.exit(1);
    }

    const existingUser = await User.findByUsername(adminUser);
    if (existingUser) {
      console.log(`Admin user "${adminUser}" already exists.`);
      process.exit(0);
    }

    await User.create({ username: adminUser, password: adminPass, role: 'admin' });
    console.log(`Admin user "${adminUser}" created successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
