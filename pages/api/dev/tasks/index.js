// File: pages/api/dev/tasks/index.js
import pool from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { project_id } = req.query;
    try {
      // Use correct column dev_project_id and assignee_id
      let query, params;
      if (project_id) {
        query = 
          'SELECT t.*, u.username AS assignee FROM dev_tasks t '
          + 'LEFT JOIN users u ON t.assignee_id = u.id '
          + 'WHERE t.dev_project_id = ? ORDER BY t.due_date';
        params = [project_id];
      } else {
        query = 
          'SELECT t.*, u.username AS assignee FROM dev_tasks t '
          + 'LEFT JOIN users u ON t.assignee_id = u.id ORDER BY t.due_date';
        params = [];
      }
      const [tasks] = await pool.query(query, params);
      return res.status(200).json(tasks);
    } catch (err) {
      console.error('GET TASKS ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Map project_id -> dev_project_id, assigned_to -> assignee_id
    const { project_id, title, description, status, assigned_to, due_date } = req.body;
    if (!project_id || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const [{ insertId }] = await pool.query(
        'INSERT INTO dev_tasks (dev_project_id, title, description, status, assignee_id, due_date) VALUES (?, ?, ?, ?, ?, ?)',
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