import mysql from 'mysql2/promise';

// Local database connection for development
const DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

const parsed = new URL(DB_URL);
parsed.searchParams.set('multipleStatements', 'true');
const pool = mysql.createPool(parsed.toString());

export default pool;
