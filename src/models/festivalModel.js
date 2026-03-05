// src/models/festivalModel.js
// Data access for Festivals table and associations
import pool from '../config/database.js';

export default class Festival {
  /**
   * Fetch all festivals, sorted by StartDate
   */
  static async findAll() {
    // Filter: Only return festivals that are not expired (ExpireDate >= today)
    const [rows] = await pool.query(`
      SELECT f.FestivalNumber, f.FestivalName, f.StartDate, f.EndDate, f.FestivalFlyerURL,
             COALESCE(v.VenueName, f.FestivalName) AS VenueName,
             COALESCE(v.City, f.City) AS City,
             COALESCE(v.State, f.State) AS State
      FROM Festivals f
      LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
      WHERE f.ExpireDate >= CURDATE()
      ORDER BY f.StartDate DESC
    `);
    return rows;
  }

  /**
   * Fetch festivals with pagination
   */
  static async findAllPaginated(limit, offset) {
    // Filter: Only return festivals that are not expired (ExpireDate >= today)
    const [rows] = await pool.query(`
      SELECT f.FestivalNumber, f.FestivalName, f.StartDate, f.EndDate, 
             f.FeaturedImageURL, f.FestivalFlyerURL,
             COALESCE(v.VenueName, f.FestivalName) AS VenueName,
             COALESCE(v.City, f.City) AS City,
             COALESCE(v.State, f.State) AS State
      FROM Festivals f
      LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
      WHERE f.ExpireDate >= CURDATE()
      ORDER BY f.StartDate ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
  }

  /**
   * Count all festivals
   */
  static async countAll() {
    // Filter: Only count festivals that are not expired (ExpireDate >= today)
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM Festivals WHERE ExpireDate >= CURDATE()');
    return rows[0].total;
  }

  /**
   * Fetch festival by FestivalNumber, join Venue, and fetch all participating Bands
   * Returns { festival, bands } or null if not found
   */
  static async findById(festivalNumber) {
    if (!festivalNumber) throw new Error('FestivalNumber is required');
    // Fetch festival and join venue
    const [festRows] = await pool.query(`
      SELECT f.FestivalNumber, f.FestivalName, f.StartDate, f.EndDate, f.ExpireDate,
             f.FeaturedImageURL, f.FestivalFlyerURL, f.FestivalWebsite,
             f.VenueNumber,
             COALESCE(v.VenueName, f.FestivalName) AS VenueName,
             COALESCE(v.GoogleMapAddress, f.GoogleMapAddress) AS GoogleMapAddress,
             COALESCE(v.City, f.City) AS City,
             COALESCE(v.State, f.State) AS State,
             COALESCE(v.Zip, f.Zip) AS Zip,
             COALESCE(v.Street, f.Street) AS Street,
             v.VenueWebsite
      FROM Festivals f
      LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
      WHERE f.FestivalNumber = ?
      LIMIT 1
    `, [festivalNumber]);
    if (!festRows[0]) return null;
    const festival = festRows[0];
    console.log('Festival Data:', festival);
    
    // Fetch participating bands by querying Concerts table (dynamic lineup)
    const [bands] = await pool.query(`
      SELECT DISTINCT b.BandNumber, b.BandName, b.PictureURL
      FROM Concerts c
      JOIN Bands b ON c.BandNumber = b.BandNumber
      WHERE c.FestivalNumber = ?
      ORDER BY b.BandName ASC
    `, [festivalNumber]);
    
    return { festival, bands };
  }
}
