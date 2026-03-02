-- Migration: Merge Venue_Location into Venues table
-- Run this once on u611894795_onelesterslist
-- Safe to run: ALTER uses IF NOT EXISTS, UPDATE only writes non-null values

-- Step 1: Add new columns to Venues
ALTER TABLE Venues
  ADD COLUMN IF NOT EXISTS Latitude  DECIMAL(10, 7) NULL,
  ADD COLUMN IF NOT EXISTS Longitude DECIMAL(10, 7) NULL,
  ADD COLUMN IF NOT EXISTS GM_CID_URL VARCHAR(500)  NULL;

-- Step 2: Copy data from Venue_Location into Venues
UPDATE Venues v
JOIN Venue_Location vl ON v.VenueNumber = vl.VenueNumber
SET
  v.Latitude    = vl.Latitude,
  v.Longitude   = vl.Longitude,
  v.GM_CID_URL  = vl.GM_CID_URL
WHERE vl.Latitude IS NOT NULL;

-- Step 3: Verify the migration (should show 0 if all rows matched)
SELECT COUNT(*) AS rows_still_missing
FROM Venue_Location vl
LEFT JOIN Venues v ON vl.VenueNumber = v.VenueNumber
WHERE vl.Latitude IS NOT NULL
  AND (v.Latitude IS NULL OR v.Longitude IS NULL);

-- Step 4 (run manually after verifying Step 3 = 0):
-- DROP TABLE Venue_Location;
