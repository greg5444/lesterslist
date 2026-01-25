-- MySQL Schema for Lesterslist
CREATE TABLE IF NOT EXISTS verification_status(
  RecordID INT AUTO_INCREMENT PRIMARY KEY,
  TableName VARCHAR(100),
  VerificationStatus ENUM('Verification Needed','Approved','Returned'),
  SearchURL VARCHAR(255),
  VerifiedBy VARCHAR(100),
  VerifiedDate DATETIME
);
