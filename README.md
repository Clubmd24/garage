# Garage-Vision Dev Portal

## Setup

1. Copy `.env.example` to `.env.local` and fill in secrets.
2. Install dependencies: `npm install`
3. Run migrations: `npm run migrate`
4. Start dev server: `npm run dev`

### Codex Integration

Set `CODEX_API_KEY` (and optionally `CODEX_API_URL`) in your environment to enable the `/api/codex` endpoint for AI-powered chat assistance.
