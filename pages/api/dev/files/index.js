import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const userId = t.sub;

  const task_id = req.query.task_id || req.body.task_id;
  const project_id = req.query.project_id || req.body.project_id;

  if (req.method === 'GET') {
    if (!task_id && !project_id) {
      return res.status(400).json({ error: 'task_id or project_id required' });
    }
    const cond = task_id ? 'f.task_id=?' : 'f.project_id=?';
    const id = task_id || project_id;
    const [files] = await pool.query(
      `SELECT f.*, u.username AS uploader
         FROM task_files f
         JOIN users u ON f.uploaded_by=u.id
        WHERE ${cond}
        ORDER BY f.created_at DESC`,
      [id]
    );
    return res.json(files);
  }

  if (req.method === 'POST') {
    const { s3_key, content_type } = req.body;
    if (!s3_key || (!task_id && !project_id)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [{ insertId }] = await pool.query(
      `INSERT INTO task_files (task_id, project_id, s3_key, content_type, uploaded_by)
       VALUES (?,?,?,?,?)`,
      [task_id || null, project_id || null, s3_key, content_type || null, userId]
    );
    return res.status(201).json({ id: insertId });
  }

  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end();
}
