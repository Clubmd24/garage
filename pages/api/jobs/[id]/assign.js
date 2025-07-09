import { assignUser, updateJob, getJobDetails } from '../../../../services/jobsService.js';
import apiHandler from '../../../../lib/apiHandler.js';
import { getTokenFromReq } from '../../../../lib/auth.js';
import pool from '../../../../lib/db.js';

async function handler(req, res) {
  const { id } = req.query;
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const [[roleRow]] = await pool.query(
    `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [t.sub]
  );
  if (!roleRow || !['office', 'admin', 'developer'].includes(roleRow.name)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    if (req.method === 'POST') {
      const {
        engineer_id,
        scheduled_start,
        scheduled_end,
        awaiting_parts,
      } = req.body || {};
      if (awaiting_parts) {
        await updateJob(id, { status: 'awaiting parts' });
      } else {
        if (!engineer_id) {
          return res.status(400).json({ error: 'engineer_id required' });
        }
        await assignUser(id, engineer_id);
        await updateJob(id, {
          status: 'awaiting assessment',
          scheduled_start,
          scheduled_end,
        });
      }
      const job = await getJobDetails(id);
      return res.status(200).json(job);
    }
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
