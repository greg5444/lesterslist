// src/controllers/mapController.js
// Controller for the Events on Map page
import pool from '../config/database.js';

export const showMap = async (req, res) => {
  try {
    // 1. Concerts — coords now live directly on Venues
    const concertQuery = `
      SELECT c.ConcertName as title, c.ConcertDate as date, 'concert' as type,
             c.ConcertNumber as id, v.Latitude, v.Longitude, v.VenueName, v.GM_CID_URL
      FROM Concerts c
      LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
      WHERE c.ConcertDate >= CURDATE() AND v.Latitude IS NOT NULL AND v.Longitude IS NOT NULL
    `;

    // 2. Festivals — coords now live directly on Venues
    const festivalQuery = `
      SELECT f.FestivalName as title, f.StartDate as date, 'festival' as type,
             f.FestivalNumber as id, v.Latitude, v.Longitude, v.VenueName, v.GM_CID_URL
      FROM Festivals f
      LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
      WHERE f.ExpireDate >= CURDATE() AND v.Latitude IS NOT NULL AND v.Longitude IS NOT NULL
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
      gmCidUrl: item.GM_CID_URL || null,
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
