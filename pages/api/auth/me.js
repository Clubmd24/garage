import pool from '../../../lib/db';
import { getTokenFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const [user] = await pool.query(
    'SELECT id, username, email FROM users WHERE id=?',
    [t.sub]
  );
  res.status(200).json(user[0]);
}
