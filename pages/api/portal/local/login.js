import pool from '../../../../lib/db';
import { verifyPassword, signToken } from '../../../../lib/auth';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { garage_name, vehicle_reg, password } = req.body || {};
  const [rows] = await pool.query(
    `SELECT c.id, c.password_hash, c.must_change_password
       FROM clients c
       JOIN vehicles v ON v.customer_id = c.id
      WHERE LOWER(c.garage_name)=LOWER(?) AND LOWER(v.licence_plate)=LOWER(?)
      LIMIT 1`,
    [garage_name, vehicle_reg]
  );
  if (!rows.length || !(await verifyPassword(password, rows[0].password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ client_id: rows[0].id });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `local_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${secure}`);
  res.status(200).json({ ok: true, must_change_password: !!rows[0].must_change_password });
}

export default apiHandler(handler);
