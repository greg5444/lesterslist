#!/bin/bash

# FTP credentials
FTP_HOST="your_hostinger_ftp_host"
FTP_USER="your_ftp_username"
FTP_PASS="your_ftp_password"

# Local directory to upload
LOCAL_DIR="src/public"

# Remote directory on the server
REMOTE_DIR="/public_html"

# Deploying files to Hostinger via FTP
echo "Starting deployment to Hostinger..."

lftp -u $FTP_USER,$FTP_PASS $FTP_HOST <<EOF
mirror -R $LOCAL_DIR $REMOTE_DIR
bye
EOF

echo "Deployment completed successfully."