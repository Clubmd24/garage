// pages/api/clients/index.js
import { getAllClients, createClient } from '@/services/clientsService';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const clients = await getAllClients();
      return res.status(200).json(clients);
    }
    if (req.method === 'POST') {
      const newClient = await createClient(req.body);
      return res.status(201).json(newClient);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
