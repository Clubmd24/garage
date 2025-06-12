import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.query;

  if (req.method === 'GET') {
    const [[project]] = await pool.query(
      `SELECT p.*, u.username AS creator
         FROM dev_projects p
         JOIN users u ON p.created_by = u.id
       WHERE p.id=?`,
      [id]
    );
    return project
      ? res.json(project)
      : res.status(404).json({ error: 'Not found' });
  }

  if (req.method === 'PUT') {
    const { name, description, status } = req.body;
    await pool.query(
      'UPDATE dev_projects SET name=?,description=?,status=? WHERE id=?',
      [name, description||null, status||'active', id]
    );
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM dev_projects WHERE id=?',[id]);
    return res.json({ ok: true });
  }

  res.setHeader('Allow',['GET','PUT','DELETE']);
  res.status(405).end();
}
