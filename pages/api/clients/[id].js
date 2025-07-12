import apiHandler from '../../../lib/apiHandler.js';
// pages/api/clients/[id].js
import { getClientById, updateClient, deleteClient } from '../../../services/clientsService';
import { UpdateClientSchema } from '../../../lib/schemas.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const client = await getClientById(id);
      return res.status(200).json(client);
    }
    if (req.method === 'PUT') {
      const data = UpdateClientSchema.parse(req.body);
      const updated = await updateClient(id, data);
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      await deleteClient(id);
      return res.status(204).end();
    }
    res.setHeader('Allow', ['GET','PUT','DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
