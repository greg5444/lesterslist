
// routes/bands.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// ✅ connect using .env variables (loaded by require('dotenv').config() in server.js)
const pool = mysql.createPool({
  host: process.env.DB_HOST,     // mysql.hostinger.com
  user: process.env.DB_USER,     // u611894795_11_admin
  password: process.env.DB_PASS, // j6wa47f62B
  database: process.env.DB_NAME  // u611894795_onelesterslist
});

// placeholder band images
const placeholders = [
  'https://images.lesterslist.com/wp-content/uploads/2026/01/295_del_mccoury.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/281_Billy_Strings.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/239_Kody_norris.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/200_Seth_Mulder_Midnight-Run.jpg'
];

// route -> show band grid
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT BandNumber, BandName, BandWebsite, PictureURL 
       FROM Bands 
       ORDER BY BandName ASC`
    );

    res.render('bands', {
      title: "Find Your Circle – Bands",
      bands: rows,
      placeholders
    });
  } catch (err) {
    console.error('Database error loading Bands:', err);
    res.status(500).send("Database connection failed");
  }
});

module.exports = router;
