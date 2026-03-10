
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = mysql.connector.connect(
        host='82.197.82.92',
        user='u611894795_11_admin',
        password='j6wa47f62B',
        database='u611894795_onelesterslist'
    )
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT f.FestivalNumber, f.FestivalName, f.GoogleMapAddress as FestMap, 
           f.Street as FestStreet, f.City as FestCity, f.State as FestState, f.Zip as FestZip,
           v.VenueName, v.GoogleMapAddress AS VenueMap, v.Street as VenueStreet, v.City as VenueCity, v.State as VenueState
    FROM Festivals f
    LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
    WHERE f.FestivalNumber = 'F26082'
    """
    
    cursor.execute(query)
    row = cursor.fetchone()
    print("--- FESTIVAL F26082 DATA ---")
    if row:
        for key, val in row.items():
            print(f"{key}: {val}")
    else:
        print("Festival not found.")
        
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
