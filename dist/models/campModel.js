// src/models/campModel.js
// Data access for Camps/Workshops table and associations
import pool from '../config/database.js';
export default class Camp {
    /**
     * Fetch all camps sorted by StartDate
     */
    static async findAll() {
        const [rows] = await pool.query(`
            SELECT JDNumber, EventName, StartDate, EndDate, DateRange, Contact, ExternalURL, ImageURL, 
             VenueName, Street, City, State, Zip, GoogleMapAddress
      FROM Camps
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
        const [rows] = await pool.query(`
      SELECT JDNumber, EventName, StartDate, EndDate, DateRange, Contact, ExternalURL, ImageURL,
             VenueName, Street, City, State, Zip, GoogleMapAddress
      FROM Camps
      WHERE JDNumber = ?
      LIMIT 1
    `, [jdNumber]);
        return rows[0] || null;
    }
}
