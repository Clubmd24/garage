import { listRequests, submitRequest } from '../../../../services/holidayRequestsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const requests = await listRequests();
    return res.status(200).json(requests);
  }
  if (req.method === 'POST') {
    const created = await submitRequest(req.body || {});
    return res.status(201).json(created);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
