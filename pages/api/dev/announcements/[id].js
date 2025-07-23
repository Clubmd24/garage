import pool from '../../../../../lib/db';
import { getTokenFromReq } from '../../../../../lib/auth';
import apiHandler from '../../../../../lib/apiHandler.js';

async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await pool.query('UPDATE messages SET deleted_at=NOW() WHERE id=?', [id]);
    return res.status(204).end();
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end();
}

export default apiHandler(handler);
