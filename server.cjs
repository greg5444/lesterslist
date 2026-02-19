'use strict';
// This file only runs on Hostinger (LiteSpeed entry point) — force production mode
process.env.NODE_ENV = 'production';
const mod = require('./dist/server');
module.exports = mod.default || mod;
