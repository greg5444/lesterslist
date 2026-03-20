"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/campModel.js
// Data access for Camps/Workshops table and associations
const database_js_1 = __importDefault(require("../config/database.js"));
class Camp {
    /**
     * Fetch all camps sorted by StartDate
     */
    static async findAll() {
        // Filter: Only return camps/workshops that are not expired (EndDate >= today)
        const [rows] = await database_js_1.default.query(`
            SELECT JDNumber, EventName, StartDate, EndDate, DateRange, Contact, ExternalURL, ImageURL, 
             VenueName, Street, City, State, Zip, GoogleMapAddress
      FROM Camps
      WHERE EndDate >= CURDATE()
      ORDER BY StartDate ASC
    `);
        return rows;
    }
    /**
     * Fetch camp by JDNumber
     * Returns null if not found
     */
    static async findById(jdNumber) {
        if (!jdNumber)
            throw new Error('JDNumber is required');
        const [rows] = await database_js_1.default.query(`
      SELECT JDNumber, EventName, StartDate, EndDate, DateRange, Contact, ExternalURL, ImageURL,
             VenueName, Street, City, State, Zip, GoogleMapAddress
      FROM Camps
      WHERE JDNumber = ?
      LIMIT 1
    `, [jdNumber]);
        return rows[0] || null;
    }
}
exports.default = Camp;
