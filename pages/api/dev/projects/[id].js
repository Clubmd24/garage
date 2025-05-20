// File: pages/api/dev/projects/[id].js

import pool from '../../../../lib/db';
import { getTokenFromReq, verifyToken } from '../../../../lib/auth';

export default async function handler(req, res) {
  // 1️⃣ Grab & verify JWT
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = payload.sub;

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [[project]] = await pool.query(
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
         WHERE p.id = ? AND p.created_by = ?`,
        [id, userId]
      );
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json(project);
    } catch (err) {
      console.error('GET PROJECT ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const { name, description, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const [result] = await pool.query(
        `UPDATE dev_projects 
           SET name = ?, description = ?, status = ? 
         WHERE id = ? AND created_by = ?`,
        [name, description || null, status || 'active', id, userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Project not found or not yours' });
      }
      return res.status(200).json({ id, name, description, status });
    } catch (err) {
      console.error('UPDATE PROJECT ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [result] = await pool.query(
        'DELETE FROM dev_projects WHERE id = ? AND created_by = ?',
        [id, userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Project not found or not yours' });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE PROJECT ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
