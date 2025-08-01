import pool from '../../../lib/db';
import apiHandler from '../../../lib/apiHandler.js';

const extractMentions = (body) =>
  Array.from(
    new Set((body.match(/@([\w.-]+)/g) || []).map((m) => m.slice(1))),
  );

async function handler(req, res) {
  const limit = parseInt(req.query.limit || '50', 10);
  const room = parseInt(req.query.room_id || '1', 10);
  try {
    const [rows] = await pool.query(
      `SELECT id, user, body, s3_key, file_name, content_type, created_at
         FROM (
           SELECT * FROM messages
            WHERE deleted_at IS NULL AND room_id=?
            ORDER BY created_at DESC LIMIT ?
         ) m
         ORDER BY created_at ASC`,
      [room, limit],
    );
    const withMentions = rows.map((r) => ({
      ...r,
      mentions: extractMentions(r.body),
    }));
    res.status(200).json(withMentions);
  } catch (err) {
    console.error('HISTORY ERROR:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default apiHandler(handler);
