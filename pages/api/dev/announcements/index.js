import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const limit = parseInt(req.query.limit || '20', 10);
  const [rows] = await pool.query(
    `SELECT id, user, body, s3_key, file_name, content_type, created_at
       FROM messages
      WHERE deleted_at IS NULL AND is_important=1
      ORDER BY created_at DESC
      LIMIT ?`,
    [limit]
  );
  res.status(200).json(rows);
}

export default apiHandler(handler);
