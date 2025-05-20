// File: pages/api/dev/projects/[id].js
import pool from '../../../../lib/db';

export default async function handler(req, res) {
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
         WHERE p.id = ?`,
        [id]
      );
      if (!project) return res.status(404).json({ error: 'Project not found' });
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
        'UPDATE dev_projects SET name = ?, description = ?, status = ? WHERE id = ?',
        [name, description || null, status || 'active', id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json({ id, name, description, status });
    } catch (err) {
      console.error('UPDATE PROJECT ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [result] = await pool.query('DELETE FROM dev_projects WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE PROJECT ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
