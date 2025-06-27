import pool from '../../../lib/db';
import { getTokenFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const userId = t.sub;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  // determine if user is developer (role id 1)
  const [[role]] = await pool.query(
    'SELECT role_id FROM user_roles WHERE user_id=?',
    [userId]
  );
  const isDeveloper = role && role.role_id === 1;

  // Aggregate projects with task counts
  const projectQuery = isDeveloper
    ? `SELECT p.id, p.name,
         COALESCE(SUM(t.status='todo'),0) AS todo,
         COALESCE(SUM(t.status='in-progress'),0) AS in_progress,
         COALESCE(SUM(t.status='done'),0) AS done
       FROM dev_projects p
       LEFT JOIN dev_tasks t ON t.dev_project_id=p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    : `SELECT p.id, p.name,
         COALESCE(SUM(t.status='todo'),0) AS todo,
         COALESCE(SUM(t.status='in-progress'),0) AS in_progress,
         COALESCE(SUM(t.status='done'),0) AS done
       FROM dev_projects p
       LEFT JOIN dev_tasks t ON t.dev_project_id=p.id AND t.created_by=?
       WHERE p.created_by=?
       GROUP BY p.id
       ORDER BY p.created_at DESC`;

  const params = isDeveloper ? [] : [userId, userId];
  const [projects] = await pool.query(projectQuery, params);

  // Important announcements flagged as important
  const [announcements] = await pool.query(
    `SELECT id, user, body, s3_key, file_name, content_type, created_at
       FROM messages
      WHERE deleted_at IS NULL AND is_important=1
      ORDER BY created_at DESC
      LIMIT 20`
  );

  res.json({ projects, announcements });
}
