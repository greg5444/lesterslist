"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/siteSettingsModel.js
const database_js_1 = __importDefault(require("../config/database.js"));
class SiteSettings {
    /**
     * Get a setting by key
     */
    static async get(key) {
        const [rows] = await database_js_1.default.query('SELECT setting_value, setting_type FROM SiteSettings WHERE setting_key = ?', [key]);
        if (!rows[0])
            return null;
        const { setting_value, setting_type } = rows[0];
        // Parse based on type
        if (setting_type === 'boolean') {
            return setting_value === 'true';
        }
        return setting_value;
    }
    /**
     * Get multiple settings
     */
    static async getMultiple(keys) {
        const [rows] = await database_js_1.default.query('SELECT setting_key, setting_value, setting_type FROM SiteSettings WHERE setting_key IN (?)', [keys]);
        const settings = {};
        rows.forEach(row => {
            const value = row.setting_type === 'boolean' ? row.setting_value === 'true' : row.setting_value;
            settings[row.setting_key] = value;
        });
        return settings;
    }
    /**
     * Set a setting value
     */
    static async set(key, value, updatedBy = 'admin') {
        await database_js_1.default.query(`INSERT INTO SiteSettings (setting_key, setting_value, updated_by) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP`, [key, value, updatedBy, value, updatedBy]);
    }
    /**
     * Get all ticker settings
     */
    static async getTickerSettings() {
        return await this.getMultiple(['ticker_enabled', 'ticker_text', 'ticker_speed']);
    }
    /**
     * Save ticker settings
     */
    static async saveTickerSettings(enabled, text, speed, updatedBy = 'admin') {
        await this.set('ticker_enabled', enabled ? 'true' : 'false', updatedBy);
        await this.set('ticker_text', text, updatedBy);
        await this.set('ticker_speed', speed, updatedBy);
    }
}
exports.default = SiteSettings;
