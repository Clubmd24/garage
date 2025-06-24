// scripts/migrate.js
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function runMigrations() {
  const urlStr = process.env.DATABASE_URL;
  if (!urlStr) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const parsed = new URL(urlStr);
  parsed.searchParams.set('multipleStatements', 'true');
  const sql = fs.readFileSync(path.resolve('./migrations/garage.sql'), 'utf8');
  // Ensure multiple statements are allowed like in lib/db.js
  const conn = await mysql.createConnection(parsed.toString());
  try {
    console.log('Running migrations...');
    await conn.query(sql);
    console.log('Migrations complete.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigrations();
