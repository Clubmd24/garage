// scripts/migrate.js
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const sql = fs.readFileSync(path.resolve('./migrations/garage.sql'), 'utf8');
  const conn = await mysql.createConnection(url);
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
