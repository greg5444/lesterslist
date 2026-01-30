require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// ✅ prefer .env port if set, otherwise default 3000
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// ✅ route imports
app.use('/bands', require('./routes/bands'));
app.use('/concerts', require('./routes/concerts'));
app.use('/festivals', require('./routes/festivals'));

// ✅ homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ start server
app.listen(PORT, () =>
  console.log(`Find Your Circle running on port ${PORT}`)
);
