// File: pages/api/dev/tasks/index.js

import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const userId = token.sub;

  if (req.method === 'GET') {
    const projectId = req.query.project_id;
    if (!projectId) {
      return res.status(400).json({ error: 'Missing project_id' });
    }
    try {
      const [tasks] = await pool.query(
        `SELECT
           t.id,
           t.title,
           t.description,
           t.status,
           t.assigned_to,
           t.due_date,
           t.created_at,
           u.username AS assigned_user
         FROM dev_tasks t
         JOIN dev_projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assigned_to = u.id
         WHERE t.project_id = ? AND p.created_by = ?
         ORDER BY t.created_at DESC`,
        [projectId, userId]
      );
      return res.status(200).json(tasks);
    } catch (err) {
      console.error('GET TASKS ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { project_id, title, description, status, assigned_to, due_date } = req.body;
    if (!project_id || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      // ensure the project belongs to this user
      const [[proj]] = await pool.query(
        'SELECT created_by FROM dev_projects WHERE id = ?',
        [project_id]
      );
      if (!proj || proj.created_by !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const [{ insertId }] = await pool.query(
        `INSERT INTO dev_tasks
           (project_id, title, description, status, assigned_to, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          project_id,
          title,
          description || null,
          status || 'todo',
          assigned_to || null,
          due_date || null
        ]
      );
      return res.status(201).json({ id: insertId });
    } catch (err) {
      console.error('CREATE TASK ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
