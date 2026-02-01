// routes/festivals.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// ✅ Connect using .env variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,      // mysql.hostinger.com
  user: process.env.DB_USER,      // u611894795_11_admin
  password: process.env.DB_PASS,  // j6wa47f62B
  database: process.env.DB_NAME   // u611894795_onelesterslist
});

// ✅ Placeholder festival images
const placeholders = [
  'https://images.lesterslist.com/wp-content/uploads/2026/01/295_del_mccoury.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/281_Billy_Strings.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/239_Kody_norris.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/200_Seth_Mulder_Midnight-Run.jpg'
];

// ✅ Route: GET /festivals
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        FestivalNumber,
        JDNumber,
        FestivalName,
        VenueNumber,
        VenueName,
        StartDate,
        EndDate,
        DateRange,
        FestivalWebsite,
        FestivalFlyerURL,
        FeaturedImageURL,
        ExpireDate
      FROM Festivals
      ORDER BY StartDate ASC
    `);

    res.render('festivals', {
      title: 'Find Your Circle – Festivals',
      festivals: rows,
      placeholders
    });
  } catch (err) {
    console.error('Database error loading Festivals:', err);
    res.status(500).send('Error retrieving festival listings');
  }
});

module.exports = router;
