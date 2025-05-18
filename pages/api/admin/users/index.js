import pool from '../../../../lib/db';
export default async function handler(req, res) {
  const [users] = await pool.query(
    'SELECT u.id, u.username, u.email, r.name AS role FROM users u JOIN user_roles ur ON u.id=ur.user_id JOIN roles r ON ur.role_id=r.id'
  );
  res.status(200).json(users);
}