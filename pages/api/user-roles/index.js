import * as service from '../../../services/userRolesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const roles = await service.getRoles();
    return res.status(200).json(roles);
  }
  if (req.method === 'POST') {
    const role = await service.createRole(req.body);
    return res.status(201).json(role);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
