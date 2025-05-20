// File: pages/api/dev/projects/index.js

import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  // → Validate JWT
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = token.sub;

  if (req.method === 'GET') {
    try {
      const [projects] = await pool.query(
        `SELECT
           p.id,
           p.name,
           p.description,
           p.status,
           p.created_at,
           p.created_by,
           u.username AS creator
         FROM dev_projects p
         JOIN users u ON p.created_by = u.id
         WHERE p.created_by = ?
         ORDER BY p.created_at DESC`,
        [userId]
      );
      return res.status(200).json(projects);
    } catch (err) {
      console.error('GET PROJECTS ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const [{ insertId }] = await pool.query(
        `INSERT INTO dev_projects
           (name, description, created_by)
         VALUES (?, ?, ?)`,
        [name, description || null, userId]
      );
      return res
        .status(201)
        .json({ id: insertId, name, description, created_by: userId });
    } catch (err) {
      console.error('CREATE PROJECT ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
