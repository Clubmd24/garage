import pool from '../../../lib/db';
import { getTokenFromReq } from '../../../lib/auth';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const [users] = await pool.query('SELECT id, username FROM users ORDER BY username');
  res.status(200).json(users);
}

export default apiHandler(handler);
