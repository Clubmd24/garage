import pool from '../../../../lib/db';
import { verifyToken } from '../../../../lib/auth';
import { parse } from 'cookie';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  if (!cookies.local_token) return res.status(401).json({ error: 'Unauthorized' });
  let payload;
  try {
    payload = verifyToken(cookies.local_token);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const [[row]] = await pool.query(
    'SELECT id, first_name, last_name, email FROM clients WHERE id=?',
    [payload.client_id]
  );
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.status(200).json(row);
}

export default apiHandler(handler);
