"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/localJamModel.js
const database_js_1 = __importDefault(require("../config/database.js"));
class LocalJam {
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
