// File: pages/api/dev/tasks/index.js
import pool from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { project_id } = req.query;
    try {
      const query = project_id
        ? 'SELECT t.*, u.username AS assignee FROM dev_tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.project_id = ? ORDER BY t.due_date'
        : 'SELECT t.*, u.username AS assignee FROM dev_tasks t LEFT JOIN users u ON t.assigned_to = u.id ORDER BY t.due_date';
      const params = project_id ? [project_id] : [];
      const [tasks] = await pool.query(query, params);
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
      const [{ insertId }] = await pool.query(
        'INSERT INTO dev_tasks (project_id, title, description, status, assigned_to, due_date) VALUES (?, ?, ?, ?, ?, ?)',
        [project_id, title, description || null, status || 'todo', assigned_to || null, due_date || null]
      );
      return res.status(201).json({ id: insertId });
    } catch (err) {
      console.error('CREATE TASK ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
