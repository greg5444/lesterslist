
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });
const pool = mysql.createPool({
  host: 'localhost',
  user: 'u611894795_onelesterslist',
  password: 'DB_PASSWORD_HERE',
  database: 'u611894795_onelesterslist'
});

router.post('/', upload.single('csvFile'), (req, res) => {
  const table = req.body.table;
  if(!req.file){ return res.json({ error:'No file uploaded.' }); }
  const fileRows = [];
  fs.createReadStream(req.file.path)
    .pipe(csv.parse({ headers: true, ignoreEmpty: true, trim: true }))
    .on('error', err => res.json({ error: err.message }))
    .on('data', row => fileRows.push(row))
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      if (!fileRows.length) return res.json({ error: 'Empty or invalid CSV.' });
      const keys = Object.keys(fileRows[0]);
      const placeholders = keys.map(()=>'?').join(',');
      let imported=0, duplicates=0, errors=0;
      const conn=pool.promise();
      const insertSQL = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
      Promise.all(fileRows.map(r=>{
        return conn.query(insertSQL,Object.values(r))
          .then(()=>imported++)
          .catch(e=>{
            if(e.code==='ER_DUP_ENTRY') duplicates++; else errors++;
          });
      })).then(()=>res.json({ table, imported, duplicates, errors }))
      .catch(err=>res.json({ error: err.message }));
    });
});

module.exports = router;
