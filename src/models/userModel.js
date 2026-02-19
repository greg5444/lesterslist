// src/models/userModel.js
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export default class User {
  static async create({ username, password, role = 'admin' }) {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO Users (Email, PasswordHash, role) VALUES (?, ?, ?)',
      [username, password_hash, role]
    );
    return result.insertId;
  }

  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT UserID, Name, Email, PasswordHash, role FROM Users WHERE Email = ? OR Name = ? LIMIT 1',
      [username, username]
    );
    return rows[0] || null;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async count() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM Users');
    return rows[0].total;
  }
}
