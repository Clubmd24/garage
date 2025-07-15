import * as service from '../../../services/userRolesService.js';
import apiHandler from '../../../lib/apiHandler.js';
import pool from '../../../lib/db';
import { getTokenFromReq } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method === 'GET') {
    const roles = await service.getRoles();
    return res.status(200).json(roles);
  }

  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const [[roleRow]] = await pool.query(
    `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [t.sub]
  );
  if (!roleRow || !['admin', 'developer'].includes(roleRow.name)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'POST') {
    const role = await service.createRole(req.body);
    return res.status(201).json(role);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
