import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';
import { clockIn, clockOut } from '../../../../services/timeEntriesService.js';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const [[roleRow]] = await pool.query(
    `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [t.sub]
  );
  if (!roleRow || roleRow.name !== 'engineer') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const action = req.query.action;
  try {
    if (action === 'clock-in') {
      const { job_id } = req.body;
      if (!job_id) return res.status(400).json({ error: 'job_id required' });
      const entry = await clockIn(job_id, t.sub);
      return res.status(201).json(entry);
    }
    if (action === 'clock-out') {
      const { entry_id } = req.body;
      if (!entry_id) return res.status(400).json({ error: 'entry_id required' });
      const entry = await clockOut(entry_id);
      if (!entry) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(entry);
    }
    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
