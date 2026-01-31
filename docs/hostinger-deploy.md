# Hostinger Deployment Guide for Directory Website

This document outlines the steps required to deploy the Directory Website application to Hostinger.

## Prerequisites

1. **Hostinger Account**: Ensure you have an active Hostinger account with access to the hosting panel.
2. **Domain Name**: Have a domain name set up and pointed to your Hostinger hosting.
3. **FTP Client**: Install an FTP client (e.g., FileZilla) for file transfer.

## Step 1: Prepare Your Application

1. **Build the Application**: Ensure your application is built and ready for deployment. Run the following command in your project directory:
   ```
   npm run build
   ```

2. **Environment Variables**: Create a `.env` file in the root of your project based on the `.env.example` file. Update the database connection settings with your Hostinger database credentials.

## Step 2: Upload Files to Hostinger

1. **Connect via FTP**:
   - Open your FTP client and connect to your Hostinger account using the FTP credentials provided in your hosting panel.

2. **Upload Files**:
   - Navigate to the `public_html` directory on your Hostinger account.
   - Upload the contents of the `dist` folder (or the folder where your built files are located) to the `public_html` directory.
   - Ensure that all necessary files, including the `node_modules` folder, are uploaded if your application requires server-side execution.

## Step 3: Set Up the Database

1. **Access the Database**:
   - Log in to your Hostinger control panel and navigate to the Database section.
   - Create a new MySQL database and user, and assign the user to the database with all privileges.

2. **Run Migrations**:
   - Use the Hostinger terminal or phpMyAdmin to run the SQL migration script located in `db/migrations/001_create_listings_table.sql` to create the necessary tables.

3. **Seed the Database** (Optional):
   - If you have initial data to seed, run the SQL script located in `db/seeders/seed_listings.sql`.

## Step 4: Configure the Application

1. **Update Hostinger Configuration**:
   - Ensure that your application is configured to use the correct database settings and any other Hostinger-specific configurations in `src/config/hostinger.ts`.

2. **Set Up Node.js**:
   - If your application requires Node.js, ensure that it is set up in your Hostinger account. You may need to configure the Node.js application settings in the control panel.

## Step 5: Test the Deployment

1. **Access Your Website**:
   - Open your web browser and navigate to your domain name to ensure that the application is running correctly.

2. **Check Logs**:
   - If you encounter any issues, check the logs in your Hostinger control panel for any error messages that can help you troubleshoot.

## Conclusion

Following these steps will help you successfully deploy your Directory Website application to Hostinger. For further assistance, refer to the Hostinger documentation or support resources.