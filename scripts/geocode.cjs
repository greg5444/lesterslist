const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const axios = require('axios');

// --- CONFIGURATION ---
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// --- THE GEOCODER ---
async function getCoordinates(address) {
    if (!address) return null;
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);
        
        if (response.data.status === 'OK') {
            return response.data.results[0].geometry.location; // Returns { lat: ..., lng: ... }
        } else {
            console.log(`   ⚠️ Google Warning: ${response.data.status} for "${address}"`);
            return null;
        }
    } catch (error) {
        console.error(`   ❌ Network Error: ${error.message}`);
        return null;
    }
}

// --- THE PROCESSOR ---
async function processTable(connection, tableName, idColumn, addressColumn) {
    console.log(`\n--- 🛠 Processing Table: ${tableName} ---`);
    
    // 1. Find rows that have an address but NO coordinates yet
    const [rows] = await connection.execute(
        `SELECT ${idColumn}, ${addressColumn} FROM ${tableName} 
         WHERE ${addressColumn} IS NOT NULL 
         AND ${addressColumn} != '' 
         AND Latitude IS NULL`
    );

    console.log(`   Found ${rows.length} locations waiting for coordinates.`);

    // 2. Loop through them one by one
    for (const row of rows) {
        const address = row[addressColumn];
        const id = row[idColumn];
        
        process.stdout.write(`   📍 Geocoding ID ${id}... `);
        
        const coords = await getCoordinates(address);

        if (coords) {
            await connection.execute(
                `UPDATE ${tableName} SET Latitude = ?, Longitude = ? WHERE ${idColumn} = ?`,
                [coords.lat, coords.lng, id]
            );
            console.log(`✅ Saved: ${coords.lat}, ${coords.lng}`);
        } else {
            console.log(`❌ Failed.`);
        }
        
        // 3. Sleep for 200ms to be nice to Google (avoid rate limits)
        await new Promise(r => setTimeout(r, 200));
    }
}

// --- MAIN EXECUTION ---
(async () => {
    console.log("🚀 Starting Geocode Backfill...");
    let connection;

    try {
        connection = await mysql.createConnection(DB_CONFIG);
        
        // Process Venues
        await processTable(connection, 'Venues', 'VenueNumber', 'GoogleMapAddress');
        
        // Process Camps
        await processTable(connection, 'Camps', 'WorkshopNumber', 'GoogleMapAddress');
        
        // Process Jams
        await processTable(connection, 'LocalJams', 'JamId', 'GoogleMapAddress');

        console.log("\n🎉 All Done! Your database now has GPS coordinates.");
        
    } catch (err) {
        console.error("\n💥 Fatal Error:", err);
    } finally {
        if (connection) connection.end();
    }
})();