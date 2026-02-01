export interface CampWorkshop {
  WorkshopNumber: string; // JDNumber, e.g., W0001
  EventName: string;
  StartDate: string; // ISO date string
  EndDate: string; // ISO date string
  DateRange: string; // e.g., "June 27 - July 1"
  VenueNumber: string;
  Contact: string;
  ExternalURL: string;
  ImageURL: string;
}
