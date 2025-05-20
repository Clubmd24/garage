// File: pages/api/dev/projects/index.js
import pool from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [projects] = await pool.query(
        `SELECT
           p.id,
           p.name,
           p.description,
           p.status,
           p.created_at,
           p.updated_at,
           p.created_by,
           u.username AS creator
         FROM dev_projects p
         JOIN users u ON p.created_by = u.id
         ORDER BY p.created_at DESC`
      );
      return res.status(200).json(projects);
    } catch (err) {
      console.error('GET PROJECTS ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { name, description, created_by } = req.body;
    if (!name || !created_by) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const [{ insertId }] = await pool.query(
        'INSERT INTO dev_projects (name, description, created_by) VALUES (?, ?, ?)',
        [name, description || null, created_by]
      );
      return res.status(201).json({ id: insertId, name, description, created_by });
    } catch (err) {
      console.error('CREATE PROJECT ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
