export interface Concert {
  concert_number: string; // JDNumber, e.g., C260020
  concert_name: string;
  simple_concert_name: string;
  concert_date: string; // ISO date string
  expire_date: string; // ISO date string
  musician_number: string; // BandNumber
  venue_number: string;
  festival_number: string;
  image: string; // External URL
}
