import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.query;

  if (req.method === 'GET') {
    const [[task]] = await pool.query(
      \`SELECT t.*, u.username AS assignee
         FROM dev_tasks t
    LEFT JOIN users u ON t.assigned_to=u.id
        WHERE t.id=?\`,
      [id]
    );
    return task ? res.json(task) : res.status(404).json({ error: 'Not found' });
  }

  if (req.method === 'PUT') {
    const { title, description, status, assigned_to, due_date } = req.body;
    await pool.query(
      \`UPDATE dev_tasks
         SET title=?,description=?,status=?,assigned_to=?,due_date=?
       WHERE id=?\`,
      [title, description||null, status, assigned_to||null, due_date||null, id]
    );
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM dev_tasks WHERE id=?',[id]);
    return res.json({ ok: true });
  }

  res.setHeader('Allow',['GET','PUT','DELETE']);
  res.status(405).end();
}
