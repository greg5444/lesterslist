// scripts/check-venue-coords.js
// Run: node scripts/check-venue-coords.js
import pool from '../src/config/database.js';

const [[stats]] = await pool.query(`
  SELECT 
    COUNT(*) as total_venues,
    SUM(CASE WHEN Latitude IS NOT NULL AND Latitude != 0 THEN 1 ELSE 0 END) as has_coords,
    SUM(CASE WHEN GM_CID_URL IS NOT NULL AND GM_CID_URL != '' THEN 1 ELSE 0 END) as has_cid,
    SUM(CASE WHEN (Latitude IS NULL OR Latitude = 0) AND GoogleMapAddress IS NOT NULL AND GoogleMapAddress != '' THEN 1 ELSE 0 END) as missing_coords_has_address,
    SUM(CASE WHEN Latitude IS NULL OR Latitude = 0 THEN 1 ELSE 0 END) as missing_coords_total,
    SUM(CASE WHEN GM_CID_URL IS NULL OR GM_CID_URL = '' THEN 1 ELSE 0 END) as missing_cid_total,
    SUM(CASE WHEN GoogleMapAddress IS NOT NULL AND GoogleMapAddress != '' THEN 1 ELSE 0 END) as has_address,
    SUM(CASE WHEN GoogleMapAddress IS NULL OR GoogleMapAddress = '' THEN 1 ELSE 0 END) as no_address
  FROM Venues
`);

console.log('\n=== Venue Coordinate Status ===');
console.log(`Total venues:                    ${stats.total_venues}`);
console.log(`Has lat/long:                    ${stats.has_coords}  ✅`);
console.log(`Has CID URL:                     ${stats.has_cid}  ✅`);
console.log(`Missing coords (have address):   ${stats.missing_coords_has_address}  ← geocodeable`);
console.log(`Missing coords (total):          ${stats.missing_coords_total}`);
console.log(`Missing CID URL (total):         ${stats.missing_cid_total}`);
console.log(`Has Google Map address:          ${stats.has_address}`);
console.log(`No address at all:               ${stats.no_address}`);
console.log('================================\n');

// Sample of venues missing coords but have an address
const [missing] = await pool.query(`
  SELECT VenueNumber, VenueName, GoogleMapAddress, City, State
  FROM Venues
  WHERE (Latitude IS NULL OR Latitude = 0)
    AND GoogleMapAddress IS NOT NULL AND GoogleMapAddress != ''
  ORDER BY VenueNumber ASC
`);

if (missing.length > 0) {
  console.log('Sample venues missing coords (have address — geocode.cjs can fix these):');
  missing.forEach(v => {
    console.log(`  ${v.VenueNumber} | ${v.VenueName} | ${v.GoogleMapAddress}`);
  });
}

process.exit(0);
