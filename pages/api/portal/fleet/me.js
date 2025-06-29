import pool from '../../../../lib/db';
import { verifyToken } from '../../../../lib/auth';
import { parse } from 'cookie';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  if (!cookies.fleet_token) return res.status(401).json({ error: 'Unauthorized' });
  let payload;
  try {
    payload = verifyToken(cookies.fleet_token);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const [[row]] = await pool.query('SELECT id, company_name FROM fleets WHERE id=?', [payload.fleet_id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.status(200).json(row);
}
