"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/concertModel.js
// Data access for Concerts table and associations
const database_js_1 = __importDefault(require("../config/database.js"));
class Concert {
    /**
     * Fetch all upcoming concerts with venue info
     */
    static async findUpcoming() {
        const [rows] = await database_js_1.default.query(`
      SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, c.ConcertImage,
             v.VenueName, v.City, v.State,
             b.PictureURL as BandPictureURL
      FROM Concerts c
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      LEFT JOIN Bands b ON c.BandNumber = b.BandNumber
      WHERE c.ConcertDate >= CURDATE()
      ORDER BY c.ConcertDate ASC
    `);
        return rows;
    }
    /**
     * Fetch upcoming concerts with pagination
     */
    static async findUpcomingPaginated(limit, offset) {
        const [rows] = await database_js_1.default.query(`
      SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, c.ConcertImage,
             v.VenueName, v.City, v.State,
             b.PictureURL as BandPictureURL
      FROM Concerts c
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      LEFT JOIN Bands b ON c.BandNumber = b.BandNumber
      WHERE c.ConcertDate >= CURDATE()
      ORDER BY c.ConcertDate ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
        return rows;
    }
    /**
     * Count upcoming concerts
     */
    static async countUpcoming() {
        const [rows] = await database_js_1.default.query(`
      SELECT COUNT(*) as total
      FROM Concerts c
      WHERE c.ConcertDate >= CURDATE()
    `);
        return rows[0].total;
    }
    /**
     * Fetch concert by ConcertNumber, joining Band, Venue, and Festival
     * Returns null if not found
     */
    static async findById(concertNumber) {
        if (!concertNumber)
            throw new Error('ConcertNumber is required');
        // Robust query with COALESCE for venue data fallback
        const [rows] = await database_js_1.default.query(`
      SELECT
        c.ConcertNumber,
        c.ConcertName,
        c.SimpleConcertName,
        c.ConcertDate,
        c.ExpireDate,
        c.ConcertImage,
        c.BandNumber,
        c.VenueNumber,
        c.FestivalNumber,
        b.BandName,
        b.BandNumber as BandNumberFromBands,
        b.PictureURL AS BandPictureURL,
        b.BandWebsite,
        COALESCE(v.VenueName, c.VenueName) AS VenueName,
        v.VenueNumber as VenueNumberFromVenues,
        COALESCE(v.GoogleMapAddress, c.GoogleMapAddress) AS GoogleMapAddress,
        COALESCE(v.VenueStreetAddress, c.Street) AS VenueStreetAddress,
        COALESCE(v.City, c.City) AS City,
        COALESCE(v.State, c.State) AS State,
        COALESCE(v.Zip, c.Zip) AS Zip,
        f.FestivalName,
        f.FestivalNumber as FestivalNumberFromFestivals
      FROM Concerts c
      LEFT JOIN Bands b ON c.BandNumber = b.BandNumber
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      LEFT JOIN Festivals f ON c.FestivalNumber = f.FestivalNumber
      WHERE c.ConcertNumber = ?
      LIMIT 1
    `, [concertNumber]);
        return rows[0] || null;
    }
}
exports.default = Concert;
