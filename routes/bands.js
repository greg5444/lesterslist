
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'mysql.hostinger.com',
  user: 'u611894795_onelesterslist',
  password: process.env.DB_PASS,
  database: 'u611894795_onelesterslist'
});

const placeholders = [
  'https://images.lesterslist.com/wp-content/uploads/2026/01/295_del_mccoury.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/281_Billy_Strings.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/239_Kody_norris.jpg',
  'https://images.lesterslist.com/wp-content/uploads/2026/01/200_Seth_Mulder_Midnight-Run.jpg'
];

router.get('/', async (req, res) => {
  let rows=[];
  try{
    [rows] = await pool.query('SELECT BandNumber, BandName, BandWebsite, PictureURL FROM Bands ORDER BY BandName ASC');
  }catch(e){
    console.error(e);
  }
  res.render('bands',{title:'Find Your Circle - Bands',bands:rows,placeholders});
});

module.exports=router;
