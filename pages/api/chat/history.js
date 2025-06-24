import pool from '../../../lib/db';

export default async function handler(req, res) {
  const limit = parseInt(req.query.limit || '50', 10);
  try {
    const [rows] = await pool.query(
      `SELECT id, user, body, s3_key, content_type, created_at
         FROM (
           SELECT * FROM messages
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC LIMIT ?
         ) m
         ORDER BY created_at ASC`,
      [limit]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('HISTORY ERROR:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
