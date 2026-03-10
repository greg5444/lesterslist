"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_js_1 = __importDefault(require("../config/database.js"));
class LocalJam {
    static async findById(JamID) {
        const [rows] = await database_js_1.default.query("SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress FROM LocalJams WHERE JamID = ? AND Status = 'Published' LIMIT 1", [JamID]);
        return rows[0] || null;
    }
    static async findPublishedFiltered(limit, offset, filters = {}) {
        let query = "SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress FROM LocalJams WHERE Status = 'Published'";
        const params = [];
        if (filters.state) {
            query += " AND State = ?";
            params.push(filters.state);
        }
        query += " ORDER BY JamName ASC LIMIT ? OFFSET ?";
        params.push(limit, offset);
        const [rows] = await database_js_1.default.query(query, params);
        return rows;
    }
    static async countPublishedFiltered(filters = {}) {
        let query = "SELECT COUNT(*) as total FROM LocalJams WHERE Status = 'Published'";
        const params = [];
        if (filters.state) {
            query += " AND State = ?";
            params.push(filters.state);
        }
        const [[{ total }]] = await database_js_1.default.query(query, params);
        return total;
    }
    static async getFilterOptions() {
        const [states] = await database_js_1.default.query("SELECT DISTINCT State FROM LocalJams WHERE Status = 'Published' AND State != '' ORDER BY State");
        return { states: states.map(s => s.State) };
    }
    static async create({ JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress }) {
        const [result] = await database_js_1.default.query('INSERT INTO LocalJams (JamName, VenueName, Schedule, SkillLevel, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [JamName, VenueName, Schedule, '', AllWelcome ? 1 : 0, BeginnersWelcome ? 1 : 0, AdvancedOnly ? 1 : 0, ContactName, ContactEmail, ContactPhone, ShowPhone ? 1 : 0, City || '', State || '', Zip || '', GoogleMapAddress || '', 'Draft']);
        return result.insertId;
    }
    static async findPublished() {
        const [rows] = await database_js_1.default.query("SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress FROM LocalJams WHERE Status = 'Published' ORDER BY JamName");
        return rows;
    }
}
exports.default = LocalJam;
