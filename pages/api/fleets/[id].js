import { getFleetById } from '../../../services/fleetsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const fleet = await getFleetById(id);
      return res.status(200).json(fleet);
    }
    if (req.method === 'PUT') {
      const { updateFleet } = await import('../../../services/fleetsService.js');
      const updated = await updateFleet(id, req.body);
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      const { deleteFleet } = await import('../../../services/fleetsService.js');
      await deleteFleet(id);
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
