"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/db/seedAdmin.js
// Run this script to create the default admin user
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_js_1 = __importDefault(require("../models/userModel.js"));
dotenv_1.default.config();
async function seedAdmin() {
    try {
        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASS;
        if (!adminPass) {
            console.error('ERROR: ADMIN_PASS not found in .env');
            process.exit(1);
        }
        const existingUser = await userModel_js_1.default.findByUsername(adminUser);
        if (existingUser) {
            console.log(`Admin user "${adminUser}" already exists.`);
            process.exit(0);
        }
        await userModel_js_1.default.create({ username: adminUser, password: adminPass, role: 'admin' });
        console.log(`Admin user "${adminUser}" created successfully.`);
        process.exit(0);
    }
    catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}
seedAdmin();
