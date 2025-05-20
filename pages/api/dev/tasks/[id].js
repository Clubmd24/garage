// File: pages/api/dev/tasks/[id].js
import pool from '../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [[task]] = await pool.query('SELECT * FROM dev_tasks WHERE id = ?', [id]);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      return res.status(200).json(task);
    } catch (err) {
      console.error('GET TASK ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const { title, description, status, assigned_to, due_date } = req.body;
    try {
      const [result] = await pool.query(
        'UPDATE dev_tasks SET title = ?, description = ?, status = ?, assigned_to = ?, due_date = ?, updated_at = NOW() WHERE id = ?',
        [title, description, status, assigned_to, due_date, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
      return res.status(200).json({ id, title, description, status, assigned_to, due_date });
    } catch (err) {
      console.error('UPDATE TASK ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [result] = await pool.query('DELETE FROM dev_tasks WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE TASK ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET','PUT','DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
