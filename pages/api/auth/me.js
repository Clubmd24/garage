import pool from '../../../lib/db';
import { getTokenFromReq } from '../../../lib/auth';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.email, r.name AS role
       FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id=?`,
    [t.sub]
  );
  res.status(200).json(rows[0]);
}

export default apiHandler(handler);
