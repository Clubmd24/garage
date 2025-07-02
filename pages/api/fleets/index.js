import { getAllFleets } from '../../../services/fleetsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
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
}

export default apiHandler(handler);
