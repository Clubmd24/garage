import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const userId = t.sub;

  if (req.method === 'GET') {
    const [projects] = await pool.query(
      `SELECT p.*, u.username AS creator
         FROM dev_projects p
         JOIN users u ON p.created_by = u.id
       WHERE p.created_by=?
       ORDER BY p.created_at DESC`,
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
