import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';
import { listActiveJobsForEngineer } from '../../../../services/jobsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
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

  try {
    if (req.method === 'GET') {
      const jobs = await listActiveJobsForEngineer(t.sub);
      return res.status(200).json(jobs);
    }
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
