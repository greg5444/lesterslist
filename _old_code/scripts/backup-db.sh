#!/bin/bash

# Backup database script for Hostinger
# Replace the following variables with your actual database credentials and settings

DB_NAME="your_database_name"
DB_USER="your_database_user"
DB_PASSWORD="your_database_password"
DB_HOST="your_database_host"
BACKUP_PATH="/path/to/your/backup/directory"
DATE=$(date +"%Y%m%d%H%M")

# Create a backup of the database
mysqldump -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME > $BACKUP_PATH/db_backup_$DATE.sql

# Check if the backup was successful
if [ $? -eq 0 ]; then
  echo "Database backup successful: $BACKUP_PATH/db_backup_$DATE.sql"
else
  echo "Database backup failed"
fi