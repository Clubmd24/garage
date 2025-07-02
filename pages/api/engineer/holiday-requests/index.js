import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';
import { listRequests, submitRequest } from '../../../../services/holidayRequestsService.js';
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
      const requests = await listRequests(t.sub);
      return res.status(200).json(requests);
    }
    if (req.method === 'POST') {
      const { start_date, end_date, status } = req.body;
      const created = await submitRequest({
        employee_id: t.sub,
        start_date,
        end_date,
        status,
      });
      return res.status(201).json(created);
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
