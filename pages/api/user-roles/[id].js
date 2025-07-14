import { updateRole, deleteRole } from '../../../services/userRolesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'PUT') {
    const role = await updateRole(id, req.body);
    return res.status(200).json(role);
  }
  if (req.method === 'DELETE') {
    await deleteRole(id);
    return res.status(204).end();
  }
  res.setHeader('Allow', ['PUT','DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
