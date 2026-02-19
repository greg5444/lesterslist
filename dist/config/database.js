"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = getConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
// Ensure .env is loaded from project root even when CWD differs
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
// Startup diagnostic — logged to stderr.log on Hostinger
console.log('[DB Config] DB_HOST:', process.env.DB_HOST || '(not set)');
console.log('[DB Config] DB_USER:', process.env.DB_USER || '(not set)');
console.log('[DB Config] DB_NAME:', process.env.DB_NAME || '(not set)');
console.log('[DB Config] DB_PORT:', process.env.DB_PORT || '(not set)');
console.log('[DB Config] DB_PASSWORD set:', process.env.DB_PASSWORD ? 'YES' : 'NO');
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    }
    catch (err) {
        console.error('Database connection failed:', err.message);
        throw new Error('Unable to connect to the database.');
    }
}
exports.default = pool;
