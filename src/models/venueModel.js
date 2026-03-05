// src/models/venueModel.js
// Data access for Venues table
import pool from '../config/database.js';

export default class Venue {
  static async findById(venueNumber) {
    if (!venueNumber) throw new Error('VenueNumber is required');
    const [rows] = await pool.query(
      'SELECT VenueNumber, VenueName, GoogleMapAddress, Street, City, State, Zip, VenueWebsite, Latitude, Longitude, GM_CID_URL FROM Venues WHERE VenueNumber = ?',
      [venueNumber]
    );
    return rows[0] || null;
  }

  static async findLinkedConcerts(venueNumber) {
    if (!venueNumber) throw new Error('VenueNumber is required');
    // TODO: Re-enable date filtering for production
    // DEV MODE: Show ALL concerts regardless of date
    const [rows] = await pool.query(`
      SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, b.BandName, b.BandNumber
      FROM Concerts c
      LEFT JOIN Bands b ON c.BandNumber = b.BandNumber
      WHERE c.VenueNumber = ?
      ORDER BY c.ConcertDate DESC
    `, [venueNumber]);
    return rows;
  }
}
