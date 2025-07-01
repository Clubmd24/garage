import pool from '../../../../lib/db';
import { verifyPassword, signToken } from '../../../../lib/auth';

export default async function handler(req, res) {
  const { garage_name, vehicle_reg, password } = req.body || {};
  const [rows] = await pool.query(
    'SELECT id, password_hash FROM clients WHERE garage_name=? AND vehicle_reg=?',
    [garage_name, vehicle_reg]
  );
  if (!rows.length || !(await verifyPassword(password, rows[0].password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ client_id: rows[0].id });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `local_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${secure}`);
  res.status(200).json({ ok: true });
}
