import pool from '../../../lib/db';
import { verifyPassword, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { identifier, email, username, password } = req.body;
  const ident = identifier || email || username;
  const [rows] = await pool.query(
    'SELECT id, password_hash FROM users WHERE email=? OR username=?',
    [ident, ident]
  );
  if (!rows.length || !(await verifyPassword(password, rows[0].password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ sub: rows[0].id });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `auth_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${secure}`
  );
  res.status(200).json({ ok: true });
}
