
const express=require('express');
const router=express.Router();
const mysql=require('mysql2');
const multer=require('multer');
const csv=require('fast-csv');
const fs=require('fs');
const upload=multer({dest:'uploads/'});
const pool=mysql.createPool({
 host:'localhost',
 user:'u611894795_onelesterslist',
 password:'DB_PASSWORD_HERE',
 database:'u611894795_onelesterslist'
});
router.post('/',upload.single('csvFile'),(req,res)=>{
 const table=req.body.table;
 if(!req.file)return res.json({error:'No file uploaded.'});
 const rows=[];
 fs.createReadStream(req.file.path)
  .pipe(csv.parse({headers:true,ignoreEmpty:true,trim:true}))
  .on('data',r=>rows.push(r))
  .on('end',async()=>{
    fs.unlinkSync(req.file.path);
    if(!rows.length)return res.json({error:'Empty or invalid CSV'});
    const keys=Object.keys(rows[0]);const placeholders=keys.map(()=>'?').join(',');
    let imported=0,duplicates=0,errors=0;
    const conn=pool.promise();
    for(const r of rows){
      try{
       await conn.query(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`,Object.values(r));
       imported++;
      }catch(e){if(e.code==='ER_DUP_ENTRY')duplicates++;else errors++;}
    }
    res.json({table,imported,duplicates,errors});
  });
});
module.exports=router;
