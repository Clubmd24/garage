import { getAllFleets } from '../../../services/fleetsService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const fleets = await getAllFleets();
      return res.status(200).json(fleets);
    }
    if (req.method === 'POST') {
      const { createFleet } = await import('../../../services/fleetsService.js');
      const fleet = await createFleet(req.body);
      return res.status(201).json(fleet);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


