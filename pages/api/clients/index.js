import apiHandler from '../../../lib/apiHandler.js';
// pages/api/clients/index.js
import {
  getAllClients,
  createClient,
  searchClients,
} from '../../../services/clientsService';

async function handler(req, res) {
    if (req.method === 'GET') {
      const { q } = req.query || {};
      const clients = q ? await searchClients(q) : await getAllClients();
      return res.status(200).json(clients);
    }
    if (req.method === 'POST') {
      const newClient = await createClient(req.body);
      return res.status(201).json(newClient);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
