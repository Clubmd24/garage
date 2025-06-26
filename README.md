# Garage-Vision Dev Portal

## Setup

1. Copy `.env.example` to `.env.local` and fill in secrets. The required variables are `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies: `npm install`
3. Make the bootstrap script executable and run it to scaffold the portal:
   `chmod +x bootstrap_dev_portal.sh && ./bootstrap_dev_portal.sh`
4. Run migrations: `npm run migrate`
   - This command executes every `.sql` file in the `migrations/` directory in
     order and records which have been run.
   - Running the script again safely skips already-applied migrations.
5. Start dev server: `npm run dev`

## Database

All database schema changes are stored as `.sql` files in the `migrations/`
directory. The migration script executes them sequentially and records the
results so it can be run repeatedly without errors.
