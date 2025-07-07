import { parse } from 'cookie';
import apiHandler from '../../../../lib/apiHandler.js';
import { verifyToken } from '../../../../lib/auth';
import { getClientById, updateClient } from '../../../../services/clientsService.js';

async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  if (!cookies.local_token) return res.status(401).json({ error: 'Unauthorized' });
  let payload;
  try {
    payload = verifyToken(cookies.local_token);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method === 'GET') {
    const client = await getClientById(payload.client_id);
    if (!client) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(client);
  }

  if (req.method === 'PUT') {
    const result = await updateClient(payload.client_id, req.body || {});
    return res.status(200).json(result);
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
