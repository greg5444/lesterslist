"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/bandModel.js
// Data access for Bands table (fields: BandNumber, BandName, BandWebsite, PictureURL)
const database_js_1 = __importDefault(require("../config/database.js"));
class Band {
    static async findAll() {
        const [rows] = await database_js_1.default.query('SELECT BandNumber, BandName, PictureURL FROM Bands ORDER BY BandName ASC');
        return rows;
    }
    static async findAllPaginated(limit, offset) {
        const [rows] = await database_js_1.default.query(`
      SELECT BandNumber, BandName, PictureURL 
      FROM Bands 
      WHERE Active = 1
      ORDER BY CASE WHEN BandName LIKE 'The %' THEN SUBSTRING(BandName, 5) ELSE BandName END ASC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);
        return rows;
    }
    static async countAll() {
        const [rows] = await database_js_1.default.query('SELECT COUNT(*) as total FROM Bands WHERE Active = 1');
        return rows[0].total;
    }
    static async findByLetter(letter) {
        const [rows] = await database_js_1.default.query('SELECT BandNumber, BandName, PictureURL FROM Bands WHERE BandName LIKE ? ORDER BY BandName ASC', [`${letter}%`]);
        return rows;
    }
    static async findByLetterPaginated(letter, limit, offset) {
        const [rows] = await database_js_1.default.query(`
      SELECT BandNumber, BandName, PictureURL 
      FROM Bands 
      WHERE Active = 1 AND (CASE WHEN BandName LIKE 'The %' THEN SUBSTRING(BandName, 5) ELSE BandName END) >= ? 
      ORDER BY CASE WHEN BandName LIKE 'The %' THEN SUBSTRING(BandName, 5) ELSE BandName END ASC 
      LIMIT ? OFFSET ?
    `, [letter, limit, offset]);
        return rows;
    }
    static async countByLetter(letter) {
        const [rows] = await database_js_1.default.query(`
      SELECT COUNT(*) as total 
      FROM Bands 
      WHERE Active = 1 AND (CASE WHEN BandName LIKE 'The %' THEN SUBSTRING(BandName, 5) ELSE BandName END) >= ?
    `, [letter]);
        return rows[0].total;
    }
    static async findById(bandNumber) {
        if (!bandNumber)
            throw new Error('BandNumber is required');
        const [rows] = await database_js_1.default.query('SELECT BandNumber, BandName, BandWebsite, PictureURL FROM Bands WHERE BandNumber = ?', [bandNumber]);
        return rows[0] || null;
    }
    static async findLinkedConcerts(bandNumber) {
        if (!bandNumber)
            throw new Error('BandNumber is required');
        // TODO: Re-enable date filtering for production
        // DEV MODE: Show ALL concerts regardless of date
        const [rows] = await database_js_1.default.query(`
      SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, v.VenueName, v.City, v.State
      FROM Concerts c
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      WHERE c.BandNumber = ?
      ORDER BY c.ConcertDate DESC
    `, [bandNumber]);
        return rows;
    }
}
exports.default = Band;
