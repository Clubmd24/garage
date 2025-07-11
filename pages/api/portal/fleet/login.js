import pool from '../../../../lib/db';
import { verifyPassword, signToken } from '../../../../lib/auth';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { garage_name, company_name, pin } = req.body || {};
  const [rows] = await pool.query(
    'SELECT id, pin_hash FROM fleets WHERE LOWER(garage_name)=LOWER(?) AND LOWER(company_name)=LOWER(?)',
    [garage_name, company_name]
  );
  if (!rows.length || !(await verifyPassword(pin, rows[0].pin_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ fleet_id: rows[0].id });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `fleet_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${secure}`);
  res.status(200).json({ ok: true });
}

export default apiHandler(handler);
