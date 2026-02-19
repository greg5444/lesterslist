import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure .env is loaded from project root even when CWD differs
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Startup diagnostic — logged to stderr.log on Hostinger
console.log('[DB Config] DB_HOST:', process.env.DB_HOST || '(not set)');
console.log('[DB Config] DB_USER:', process.env.DB_USER || '(not set)');
console.log('[DB Config] DB_NAME:', process.env.DB_NAME || '(not set)');
console.log('[DB Config] DB_PORT:', process.env.DB_PORT || '(not set)');
console.log('[DB Config] DB_PASSWORD set:', process.env.DB_PASSWORD ? 'YES' : 'NO');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (err) {
        console.error('Database connection failed:', err.message);
        throw new Error('Unable to connect to the database.');
    }
}

export default pool;
