
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname,'public')));

const pages=['','artists','concerts','festivals','camps','jams','instruction','venues','login'];
pages.forEach(p=>{
  const route=p===''?'/':'/'+p;
  const file=p===''?'index.html':p+'.html';
  app.get(route,(req,res)=>res.sendFile(path.join(__dirname,'public',file)));
});

app.listen(PORT,()=>console.log(`🎻 Lesterslist live on http://localhost:${PORT}`));
