"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/venueModel.js
// Data access for Venues table
const database_js_1 = __importDefault(require("../config/database.js"));
class Venue {
    static async findById(venueNumber) {
        if (!venueNumber)
            throw new Error('VenueNumber is required');
        const [rows] = await database_js_1.default.query('SELECT VenueNumber, VenueName, GoogleMapAddress, VenueStreetAddress, City, State, Zip, Latitude, Longitude, GM_CID_URL FROM Venues WHERE VenueNumber = ?', [venueNumber]);
        return rows[0] || null;
    }
    static async findLinkedConcerts(venueNumber) {
        if (!venueNumber)
            throw new Error('VenueNumber is required');
        // TODO: Re-enable date filtering for production
        // DEV MODE: Show ALL concerts regardless of date
        const [rows] = await database_js_1.default.query(`
      SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, b.BandName, b.BandNumber
      FROM Concerts c
      LEFT JOIN Bands b ON c.BandNumber = b.BandNumber
      WHERE c.VenueNumber = ?
      ORDER BY c.ConcertDate DESC
    `, [venueNumber]);
        return rows;
    }
}
exports.default = Venue;
