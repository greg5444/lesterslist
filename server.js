
const express=require('express');
const path=require('path');
const app=express();
const PORT=process.env.PORT||3000;
app.use(express.static(path.join(__dirname,'public')));
const uploadRouter=require('./backend/upload');
app.use('/upload',uploadRouter);
app.listen(PORT,()=>console.log('Apollo One running on port '+PORT));
