import apiHandler from '../../../lib/apiHandler.js';
// pages/api/clients/index.js
import {
  getAllClients,
  createClient,
  searchClients,
  getClientsWithVehicleDetails,
} from '../../../services/clientsService';
import { CreateClientSchema } from '../../../lib/schemas.js';

async function handler(req, res) {
    if (req.method === 'GET') {
      const { q } = req.query || {};
      const clients = q ? await searchClients(q) : await getClientsWithVehicleDetails();
      return res.status(200).json(clients);
    }
    if (req.method === 'POST') {
      const data = CreateClientSchema.parse(req.body);
      const newClient = await createClient(data);
      return res.status(201).json(newClient);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
