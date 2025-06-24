import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const userId = t.sub;
  const project_id = req.query.project_id || req.body.project_id;

  if (req.method === 'GET') {
    if (!project_id) {
      return res.status(400).json({ error: 'project_id required' });
    }
    const [tasks] = await pool.query(
      `SELECT t.*, u.username AS assignee
         FROM dev_tasks t
    LEFT JOIN users u ON t.assigned_to=u.id
        WHERE t.dev_project_id=? AND t.created_by=?
     ORDER BY t.created_at DESC`,
      [project_id, userId]
    );
    return res.json(tasks);
  }

  if (req.method === 'POST') {
    if (!project_id) {
      return res.status(400).json({ error: 'project_id required' });
    }
    const { title, description, status, assigned_to, due_date } = req.body;
    const [{ insertId }] = await pool.query(
      `INSERT INTO dev_tasks
         (dev_project_id,title,description,status,created_by,assigned_to,due_date)
       VALUES (?,?,?,?,?,?,?)`,
      [project_id, title, description||null, status, userId, assigned_to||null, due_date||null]
    );
    return res.status(201).json({ id: insertId });
  }

  res.setHeader('Allow',['GET','POST']);
  res.status(405).end();
}
