import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const userId = t.sub;

  if (req.method === 'GET') {
    // check role id. role_id 1 should see all projects
    const [[role]] = await pool.query(
      'SELECT role_id FROM user_roles WHERE user_id=?',
      [userId]
    );
    const isDeveloper = role && role.role_id === 1;

    const baseQuery = `SELECT p.*, u.username AS creator
         FROM dev_projects p
         JOIN users u ON p.created_by = u.id`;
    const [projects] = isDeveloper
      ? await pool.query(`${baseQuery} ORDER BY p.created_at DESC`)
      : await pool.query(
          `${baseQuery} WHERE p.created_by=? ORDER BY p.created_at DESC`,
          [userId]
        );
    return res.json(projects);
  }

  if (req.method === 'POST') {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const [{ insertId }] = await pool.query(
      'INSERT INTO dev_projects (name,description,created_by) VALUES (?,?,?)',
      [name, description||null, userId]
    );
    return res.status(201).json({ id: insertId });
  }

  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end();
}
