# Garage-Vision Dev Portal

## Setup

1. Copy `.env.example` to `.env.local` and fill in secrets. The required variables are `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies: `npm install`
3. Make the bootstrap script executable and run it to scaffold the portal:
   `chmod +x bootstrap_dev_portal.sh && ./bootstrap_dev_portal.sh`
4. Run migrations (this will also create the `clients` table): `npm run migrate`
5. Start dev server: `npm run dev`

## Database

The schema used by the migration script lives in `migrations/garage.sql`.
This file is the single source of truth for the initial database structure.
