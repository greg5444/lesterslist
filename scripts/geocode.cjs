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
            const result = response.data.results[0];
            // Extract place_id to construct Google Maps URL
            const gmapUrl = result.place_id
                ? `https://www.google.com/maps/place/?q=place:${result.place_id}`
                : null;

            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                gmapUrl: gmapUrl
            };
        } else {
            console.log(`   ⚠️ Google Warning: ${response.data.status} for "${address}"`);
            return null;
        }
    } catch (error) {
        console.error(`   ❌ Network Error: ${error.message}`);
        return null;
    }
}

// --- VENUE PROCESSOR (writes directly to Venues table) ---
async function processVenues(connection) {
    console.log(`\n--- 🛠 Processing Venues ---`);

    // Find venues with a GoogleMapAddress but missing Latitude or GM_CID_URL
    const [rows] = await connection.execute(
        `SELECT VenueNumber, GoogleMapAddress FROM Venues
         WHERE GoogleMapAddress IS NOT NULL
         AND GoogleMapAddress != ''
         AND (Latitude IS NULL OR Latitude = 0 OR GM_CID_URL IS NULL)`
    );

    console.log(`   Found ${rows.length} venues waiting for coordinates.`);

    for (const row of rows) {
        const address = row.GoogleMapAddress;
        const id = row.VenueNumber;

        process.stdout.write(`   📍 Geocoding ${id}... `);

        const coords = await getCoordinates(address);

        if (coords) {
            await connection.execute(
                `UPDATE Venues SET Latitude = ?, Longitude = ?, GM_CID_URL = ? WHERE VenueNumber = ?`,
                [coords.lat, coords.lng, coords.gmapUrl, id]
            );
            console.log(`✅ Saved: ${coords.lat}, ${coords.lng}${coords.gmapUrl ? ' + CID URL' : ''}`);
        } else {
            console.log(`❌ Failed.`);
        }

        // Sleep 500ms to avoid hitting Google rate limits
        await new Promise(r => setTimeout(r, 500));
    }
}

// --- CAMPS/JAMS PROCESSOR (writes to their own table) ---
async function processTable(connection, tableName, idColumn, addressColumn) {
    console.log(`\n--- 🛠 Processing Table: ${tableName} ---`);

    // Find rows with an address but no coordinates yet
    const [rows] = await connection.execute(
        `SELECT ${idColumn}, ${addressColumn} FROM ${tableName}
         WHERE ${addressColumn} IS NOT NULL
         AND ${addressColumn} != ''
         AND Latitude IS NULL`
    );

    console.log(`   Found ${rows.length} locations waiting for coordinates.`);

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

        // Sleep 500ms to avoid hitting Google rate limits
        await new Promise(r => setTimeout(r, 500));
    }
}

// --- MAIN EXECUTION ---
(async () => {
    console.log("🚀 Starting Geocode Backfill...");
    let connection;

    try {
        connection = await mysql.createConnection(DB_CONFIG);

        // Venues → coordinates go into Venue_Location
        await processVenues(connection);

        // Camps → coordinates stored directly on Camps table
        await processTable(connection, 'Camps', 'WorkshopNumber', 'GoogleMapAddress');

        // Jams → coordinates stored directly on LocalJams table
        await processTable(connection, 'LocalJams', 'JamId', 'GoogleMapAddress');

        console.log("\n🎉 All Done! Your database now has GPS coordinates.");

    } catch (err) {
        console.error("\n💥 Fatal Error:", err);
    } finally {
        if (connection) connection.end();
    }
})();
