import pool from '../../../../../lib/db';
export default async function handler(req, res) {
  const { id } = req.query;
  const { role } = req.body;
  // Update pivot
  const [[r]] = await pool.query('SELECT id FROM roles WHERE name=?', [role]);
  await pool.query('UPDATE user_roles SET role_id=? WHERE user_id=?', [r.id, id]);
  res.status(200).json({ ok:true });
}