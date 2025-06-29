import pool from '../../../../lib/db';
import { signToken } from '../../../../lib/auth';

export default async function handler(req, res) {
  const { email } = req.body || {};
  const [rows] = await pool.query('SELECT id FROM clients WHERE email=?', [email]);
  if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ client_id: rows[0].id });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `local_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${secure}`);
  res.status(200).json({ ok: true });
}
