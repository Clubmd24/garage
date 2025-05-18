import pool from '../../../lib/db';
import { verifyPassword, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email=?', [email]);
  if (!rows.length) return res.status(401).json({ error:'Invalid credentials' });
  const valid = await verifyPassword(password, rows[0].password_hash);
  if (!valid) return res.status(401).json({ error:'Invalid credentials' });
  const token = signToken({ sub: rows[0].id });
  res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=28800`);
  res.status(200).json({ ok:true });
}