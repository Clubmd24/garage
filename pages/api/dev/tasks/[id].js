// File: pages/api/dev/tasks/[id].js

import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const userId = token.sub;
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [[task]] = await pool.query(
        `SELECT
           t.id,
           t.project_id,
           t.title,
           t.description,
           t.status,
           t.assigned_to,
           t.due_date,
           t.created_at
         FROM dev_tasks t
         JOIN dev_projects p ON t.project_id = p.id
         WHERE t.id = ? AND p.created_by = ?`,
        [id, userId]
      );
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json(task);
    } catch (err) {
      console.error('GET TASK ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const { title, description, status, assigned_to, due_date } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const [result] = await pool.query(
        `UPDATE dev_tasks t
           JOIN dev_projects p ON t.project_id = p.id
         SET t.title       = ?,
             t.description = ?,
             t.status      = ?,
             t.assigned_to = ?,
             t.due_date    = ?
         WHERE t.id = ? AND p.created_by = ?`,
        [
          title,
          description || null,
          status || 'todo',
          assigned_to || null,
          due_date || null,
          id,
          userId
        ]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json({ id, title, description, status, assigned_to, due_date });
    } catch (err) {
      console.error('UPDATE TASK ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [result] = await pool.query(
        `DELETE t FROM dev_tasks t
         JOIN dev_projects p ON t.project_id = p.id
         WHERE t.id = ? AND p.created_by = ?`,
        [id, userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE TASK ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
