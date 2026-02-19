// src/controllers/mapController.js
// Controller for the Events on Map page
import pool from '../config/database.js';

export const showMap = async (req, res) => {
  try {
    // 1. Concerts (Join Venues + Venue_Location for Coords)
    const concertQuery = `
      SELECT c.ConcertName as title, c.ConcertDate as date, 'concert' as type, 
             c.ConcertNumber as id, vl.Latitude, vl.Longitude, v.VenueName
      FROM Concerts c
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      LEFT JOIN Venue_Location vl ON c.VenueNumber = vl.VenueNumber
      WHERE c.ConcertDate >= CURDATE() AND vl.Latitude IS NOT NULL
    `;

    // 2. Festivals (Join Venues + Venue_Location for Coords)
    const festivalQuery = `
      SELECT f.FestivalName as title, f.StartDate as date, 'festival' as type, 
             f.FestivalNumber as id, vl.Latitude, vl.Longitude, v.VenueName
      FROM Festivals f
      LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
      LEFT JOIN Venue_Location vl ON f.VenueNumber = vl.VenueNumber
      WHERE f.EndDate >= CURDATE() AND vl.Latitude IS NOT NULL
    `;

    // 3. Camps (Coords on Table - ID is JDNumber)
    const campQuery = `
      SELECT EventName as title, DateRange as date, 'camp' as type, 
             JDNumber as id, Latitude, Longitude, VenueName
      FROM Camps WHERE Latitude IS NOT NULL
    `;

    // 4. Jams (Coords on Table - ID is JamId - NO Active check)
    const jamQuery = `
      SELECT JamName as title, Schedule as date, 'jam' as type, 
             JamId as id, Latitude, Longitude, City as VenueName
      FROM LocalJams WHERE Latitude IS NOT NULL
    `;

    const [concerts] = await pool.query(concertQuery);
    const [festivals] = await pool.query(festivalQuery);
    const [camps] = await pool.query(campQuery);
    const [jams] = await pool.query(jamQuery);

    const mapData = [...concerts, ...festivals, ...camps, ...jams].map(item => ({
      type: item.type,
      title: item.title,
      lat: parseFloat(item.Latitude),
      lng: parseFloat(item.Longitude),
      date: item.date,
      venue: item.VenueName,
      url: item.type === 'concert' ? `/concerts/${item.id}` : 
           item.type === 'festival' ? `/festivals/${item.id}` : 
           item.type === 'camp' ? `/camps/${item.id}` : `/jams`
    }));

    console.log(`📍 Map loaded with ${mapData.length} events (${concerts.length} concerts, ${festivals.length} festivals, ${camps.length} camps, ${jams.length} jams)`);

    res.render('map/index', { 
      title: 'Events Map - Lester\'s List',
      mapData: mapData,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
    });

  } catch (error) {
    console.error('💥 Map Error:', error);
    res.status(500).send('Error loading map. Check terminal for details.');
  }
};
