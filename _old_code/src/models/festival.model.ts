export interface Festival {
  festival_number: string; // JDNumber, e.g., F0001
  FestivalName: string;
  StartDate: string; // ISO date string
  EndDate: string; // ISO date string
  ExpireDate: string; // ISO date string
  venue_number: string;
  ParticipatingBands: string[]; // List of BandNumbers
  FlyerImage: string; // External URL
}
