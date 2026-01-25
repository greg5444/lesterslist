-- Lesterslist.com MySQL Schema
CREATE TABLE Artists(
  BandNumber VARCHAR(10) PRIMARY KEY,
  BandName VARCHAR(255),
  BandWebsite VARCHAR(255),
  PictureURL VARCHAR(255)
);
CREATE TABLE Venues(
  VenueNumber VARCHAR(10) PRIMARY KEY,
  VenueName VARCHAR(255),
  StreetAddress VARCHAR(255),
  CityStateZip VARCHAR(255),
  GoogleMapAddress VARCHAR(255),
  VenueURL VARCHAR(255),
  FullState VARCHAR(100)
);
CREATE TABLE Concerts(
  JDNumber VARCHAR(10) PRIMARY KEY,
  ConcertName VARCHAR(255),
  ConcertDate DATE,
  BandNumber VARCHAR(10),
  VenueNumber VARCHAR(10),
  FestivalNumber VARCHAR(10),
  FOREIGN KEY (BandNumber) REFERENCES Artists(BandNumber),
  FOREIGN KEY (VenueNumber) REFERENCES Venues(VenueNumber)
);
CREATE TABLE Festivals(
  FestivalNumber VARCHAR(10) PRIMARY KEY,
  FestivalName VARCHAR(255),
  VenueNumber VARCHAR(10),
  StartDate DATE,
  EndDate DATE,
  FOREIGN KEY (VenueNumber) REFERENCES Venues(VenueNumber)
);
CREATE TABLE LocalJams(
  JamID INT AUTO_INCREMENT PRIMARY KEY,
  JamName VARCHAR(255),
  VenueNumber VARCHAR(10),
  Schedule VARCHAR(255),
  FOREIGN KEY (VenueNumber) REFERENCES Venues(VenueNumber)
);
