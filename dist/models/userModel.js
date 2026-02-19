"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/userModel.js
const database_js_1 = __importDefault(require("../config/database.js"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class User {
    static async create({ username, password, role = 'admin' }) {
        const password_hash = await bcryptjs_1.default.hash(password, 10);
        const [result] = await database_js_1.default.query('INSERT INTO Users (Email, PasswordHash, role) VALUES (?, ?, ?)', [username, password_hash, role]);
        return result.insertId;
    }
    static async findByUsername(username) {
        const [rows] = await database_js_1.default.query('SELECT UserID, Name, Email, PasswordHash, role FROM Users WHERE Email = ? OR Name = ? LIMIT 1', [username, username]);
        return rows[0] || null;
    }
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcryptjs_1.default.compare(plainPassword, hashedPassword);
    }
    static async count() {
        const [rows] = await database_js_1.default.query('SELECT COUNT(*) as total FROM Users');
        return rows[0].total;
    }
}
exports.default = User;
