# Garage-Vision Dev Portal

## Setup

1. Copy `.env.example` to `.env.local` and fill in secrets.
2. Install dependencies: `npm install`
3. Make the bootstrap script executable and run it to scaffold the portal:
   `chmod +x bootstrap_dev_portal.sh && ./bootstrap_dev_portal.sh`
4. Run migrations: `npm run migrate`
5. Start dev server: `npm run dev`
