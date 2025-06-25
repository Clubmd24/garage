import mysql from 'mysql2/promise';

const urlStr = process.env.DATABASE_URL;
if (!urlStr) {
  throw new Error('DATABASE_URL is not defined');
}

const parsed = new URL(urlStr);
parsed.searchParams.set('multipleStatements', 'true');
const pool = mysql.createPool(parsed.toString());

export default pool;
