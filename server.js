require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ serve static files first
app.use(express.static(path.join(__dirname, 'public')));

// ✅ root route must exist after the static middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ then hook up the feature routes
app.use('/bands', require('./routes/bands'));
app.use('/concerts', require('./routes/concerts'));
app.use('/festivals', require('./routes/festivals'));

// ✅ start the app
app.listen(PORT, () =>
  console.log(`Find Your Circle running on port ${PORT}`)
);
