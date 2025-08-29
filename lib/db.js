import mysql from 'mysql2/promise';

// Use environment variable if available (Heroku), otherwise use local fallback
const urlStr = process.env.DATABASE_URL || 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

const parsed = new URL(urlStr);
parsed.searchParams.set('multipleStatements', 'true');
const pool = mysql.createPool(parsed.toString());

export default pool;
