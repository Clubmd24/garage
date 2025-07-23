import pool from '../../../lib/db';
import { getTokenFromReq } from '../../../lib/auth';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { section, description } = req.body;
  if (!section || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const [[user]] = await pool.query('SELECT username FROM users WHERE id=?', [t.sub]);
  const body = `[${section}] ${description}`;
  await pool.query(
    'INSERT INTO messages (room_id, user, body, is_important) VALUES (1, ?, ?, 1)',
    [user?.username || 'unknown', body]
  );

  res.status(201).json({ ok: true });
}

export default apiHandler(handler);
