import { getAllFleets } from '../../../services/fleetsService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const fleets = await getAllFleets();
      return res.status(200).json(fleets);
    }
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
