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
  const conn = await mysql.createConnection(parsed.toString());
  try {
    console.log('Running migrations...');

    // Ensure a table exists to track executed migrations
    await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      filename VARCHAR(255) UNIQUE NOT NULL,
      run_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const files = fs
      .readdirSync(path.resolve('./migrations'))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const [[already]] = await conn.query(
        'SELECT 1 FROM schema_migrations WHERE filename = ? LIMIT 1',
        [file]
      );
      if (already) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(
        path.resolve('./migrations', file),
        'utf8'
      );
      console.log(`Applying ${file}...`);
      await conn.query(sql);
      await conn.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
    }

    console.log('Migrations complete.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigrations();
