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
   * Fetch upcoming festivals with filters + pagination
   */
  static async findUpcomingFiltered(limit, offset, { state, month, lat, lng, radius = 50 } = {}) {
    const conditions = ['f.ExpireDate >= CURDATE()'];
    const params = [];
    let orderBy = 'f.StartDate ASC';
    let distanceField = '';

    if (state) {
      conditions.push('(COALESCE(v.State, f.State) = ?)');
      params.push(state);
    }
    if (month) {
      if (month === 'next-two-weeks') {
        conditions.push('f.StartDate <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)');
      } else {
        conditions.push('DATE_FORMAT(f.StartDate, \'%Y-%m\') = ?');
        params.push(month);
      }
    }
    if (lat && lng) {
      distanceField = `, (
        3959 * acos(
          cos(radians(?)) * cos(radians(v.Latitude)) *
          cos(radians(v.Longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(v.Latitude))
        )
      ) AS distance`;
      params.unshift(lat, lng, lat);
      conditions.push('v.Latitude IS NOT NULL AND v.Longitude IS NOT NULL');
      conditions.push('((3959 * acos(cos(radians(?)) * cos(radians(v.Latitude)) * cos(radians(v.Longitude) - radians(?)) + sin(radians(?)) * sin(radians(v.Latitude)))) <= ?)');
      params.push(lat, lng, lat, radius);
      orderBy = 'distance ASC, f.StartDate ASC';
    }

    const where = conditions.join(' AND ');
    const [rows] = await pool.query(`
      SELECT f.FestivalNumber, f.FestivalName, f.StartDate, f.EndDate,
             f.FeaturedImageURL, f.FestivalFlyerURL,
             COALESCE(v.VenueName, f.FestivalName) AS VenueName,
             COALESCE(v.City, f.City) AS City,
             COALESCE(v.State, f.State) AS State ${distanceField}
      FROM Festivals f
      LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    return rows;
  }

  /**
   * Count upcoming festivals with filters
   */
  static async countUpcomingFiltered({ state, month, lat, lng, radius = 50 } = {}) {
    const conditions = ['f.ExpireDate >= CURDATE()'];
    const params = [];
    if (state) {
      conditions.push('(COALESCE(v.State, f.State) = ?)');
      params.push(state);
    }
    if (month) {
      if (month === 'next-two-weeks') {
        conditions.push('f.StartDate <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)');
      } else {
        conditions.push('DATE_FORMAT(f.StartDate, \'%Y-%m\') = ?');
        params.push(month);
      }
    }
    if (lat && lng) {
      conditions.push('v.Latitude IS NOT NULL AND v.Longitude IS NOT NULL');
      conditions.push('((3959 * acos(cos(radians(?)) * cos(radians(v.Latitude)) * cos(radians(v.Longitude) - radians(?)) + sin(radians(?)) * sin(radians(v.Latitude)))) <= ?)');
      params.push(lat, lng, lat, radius);
    }
    const where = conditions.join(' AND ');
    const [rows] = await pool.query(`
      SELECT COUNT(*) as total
      FROM Festivals f
      LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
      WHERE ${where}
    `, params);
    return rows[0].total;
  }

  /**
   * Get distinct states and months available for upcoming festivals
   */
  static async getFilterOptions() {
    const [states] = await pool.query(`
      SELECT DISTINCT COALESCE(v.State, f.State) as State
      FROM Festivals f
      LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
      WHERE f.ExpireDate >= CURDATE()
        AND COALESCE(v.State, f.State) IS NOT NULL
        AND COALESCE(v.State, f.State) != ''
      ORDER BY State ASC
    `);
    const [months] = await pool.query(`
      SELECT DISTINCT DATE_FORMAT(StartDate, '%Y-%m') as month,
                      DATE_FORMAT(StartDate, '%b %Y') as label
      FROM Festivals
      WHERE ExpireDate >= CURDATE()
      ORDER BY month ASC
    `);
    return {
      states: states.map(r => r.State),
      months: months.map(r => ({ value: r.month, label: r.label }))
    };
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
