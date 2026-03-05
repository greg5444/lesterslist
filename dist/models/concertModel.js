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
     * Fetch upcoming concerts with filters + pagination
     */
    static async findUpcomingFiltered(limit, offset, { state, month } = {}) {
        const conditions = ['c.ConcertDate >= CURDATE()'];
        const params = [];
        if (state) {
            conditions.push('(v.State = ? OR c.State = ?)');
            params.push(state, state);
        }
        if (month) {
            conditions.push('DATE_FORMAT(c.ConcertDate, \'%Y-%m\') = ?');
            params.push(month);
        }
        const where = conditions.join(' AND ');
        const [rows] = await database_js_1.default.query(`
      SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, c.ConcertImage,
             v.VenueName, COALESCE(v.City, c.City) as City, COALESCE(v.State, c.State) as State,
             b.PictureURL as BandPictureURL
      FROM Concerts c
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      LEFT JOIN Bands b ON c.BandNumber = b.BandNumber
      WHERE ${where}
      ORDER BY c.ConcertDate ASC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
        return rows;
    }
    /**
     * Count upcoming concerts with filters
     */
    static async countUpcomingFiltered({ state, month } = {}) {
        const conditions = ['c.ConcertDate >= CURDATE()'];
        const params = [];
        if (state) {
            conditions.push('(v.State = ? OR c.State = ?)');
            params.push(state, state);
        }
        if (month) {
            conditions.push('DATE_FORMAT(c.ConcertDate, \'%Y-%m\') = ?');
            params.push(month);
        }
        const where = conditions.join(' AND ');
        const [rows] = await database_js_1.default.query(`
      SELECT COUNT(*) as total
      FROM Concerts c
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      WHERE ${where}
    `, params);
        return rows[0].total;
    }
    /**
     * Get distinct states and months available for upcoming concerts
     */
    static async getFilterOptions() {
        const [states] = await database_js_1.default.query(`
      SELECT DISTINCT COALESCE(v.State, c.State) as State
      FROM Concerts c
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      WHERE c.ConcertDate >= CURDATE()
        AND COALESCE(v.State, c.State) IS NOT NULL
        AND COALESCE(v.State, c.State) != ''
      ORDER BY State ASC
    `);
        const [months] = await database_js_1.default.query(`
      SELECT DISTINCT DATE_FORMAT(ConcertDate, '%Y-%m') as month,
                      DATE_FORMAT(ConcertDate, '%b %Y') as label
      FROM Concerts
      WHERE ConcertDate >= CURDATE()
      ORDER BY month ASC
    `);
        return {
            states: states.map(r => r.State),
            months: months.map(r => ({ value: r.month, label: r.label }))
        };
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
        COALESCE(v.Street, c.Street) AS Street,
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
