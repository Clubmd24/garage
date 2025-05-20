// File: pages/api/admin/users/index.js
import pool from '../../../../lib/db';
import { hashPassword } from '../../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Fetch all users with their roles
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, r.name AS role
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id`);
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    try {
      // Insert into users table
      const hashedPassword = await hashPassword(password);
      const [{ insertId: userId }] = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      // Look up role ID by name
      const [[roleRow]] = await pool.query(
        'SELECT id FROM roles WHERE name = ?',
        [role]
      );

      // Associate the new user with that role
      if (roleRow) {
        await pool.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleRow.id]
        );
      }

      // Return the created user info
      return res.status(200).json({ id: userId, username, email, role });
    } catch (err) {
      console.error('CREATE USER ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
