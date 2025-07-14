import apiHandler from '../../../../lib/apiHandler.js';
// File: pages/api/admin/users/index.js
import pool from '../../../../lib/db';
import { hashPassword, getTokenFromReq } from '../../../../lib/auth';

async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const [[roleRow]] = await pool.query(
    `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [t.sub]
  );
  if (!roleRow || !['admin', 'developer'].includes(roleRow.name)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method === 'GET') {
    // return all users + roles
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, r.name AS role, r.description
         FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         JOIN roles r ON ur.role_id = r.id`
    );
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    try {
      const hashed = await hashPassword(password);
      const [{ insertId: userId }] = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, hashed]
      );
      const [[roleRow]] = await pool.query(
        'SELECT id FROM roles WHERE name = ?',
        [role]
      );
      if (roleRow) {
        await pool.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleRow.id]
        );
        if (role === 'apprentice') {
          const [firstName, ...rest] = username.split(' ');
          const lastName = rest.join(' ') || firstName;
          await pool.query(
            'INSERT INTO apprentices (first_name, last_name, email) VALUES (?, ?, ?)',
            [firstName, lastName, email]
          );
        }
      }
      return res.status(200).json({ id: userId, username, email, role });
    } catch (err) {
      console.error('CREATE USER ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
