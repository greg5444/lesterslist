# Directory Website

## Overview
This project is a directory website that allows users to browse and manage listings. It is built using TypeScript and Express, and is designed to be deployed on Hostinger.

## Features
- User authentication and authorization
- CRUD operations for listings
- Responsive design with CSS
- API and web routes for handling requests
- Database migrations and seeders for initial data setup

## Project Structure
```
directory-website
├── src
│   ├── server.ts
│   ├── app.ts
│   ├── config
│   │   ├── database.ts
│   │   └── hostinger.ts
│   ├── controllers
│   │   ├── listingsController.ts
│   │   └── authController.ts
│   ├── routes
│   │   ├── api.ts
│   │   └── web.ts
│   ├── models
│   │   └── listing.model.ts
│   ├── services
│   │   └── listingService.ts
│   ├── views
│   │   └── index.pug
│   └── public
│       ├── css
│       │   └── main.css
│       └── js
│           └── main.js
├── db
│   ├── migrations
│   │   └── 001_create_listings_table.sql
│   └── seeders
│       └── seed_listings.sql
├── scripts
│   ├── deploy-ftp.sh
│   └── backup-db.sh
├── .github
│   └── workflows
│       └── deploy.yml
├── .gitignore
├── .env.example
├── package.json
├── tsconfig.json
├── knexfile.ts
├── tests
│   ├── unit
│   │   └── listing.test.ts
│   └── integration
│       └── api.test.ts
├── docs
│   └── hostinger-deploy.md
├── LICENSE
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd directory-website
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the environment variables:
   - Copy `.env.example` to `.env` and fill in the required values.

4. Run database migrations:
   ```
   npx knex migrate:latest
   ```

5. Seed the database with initial data:
   ```
   npx knex seed:run
   ```

6. Start the application:
   ```
   npm start
   ```

## Usage
- Access the website at `http://localhost:3000`.
- Use the API endpoints for managing listings and user authentication.

## Deployment
For deployment instructions to Hostinger, refer to the `docs/hostinger-deploy.md` file.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.