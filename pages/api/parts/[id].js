import { getPartById, updatePart, deletePart } from '../../../services/partsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const part = await getPartById(id);
      return res.status(200).json(part);
    }
    if (req.method === 'PUT') {
      const updated = await updatePart(id, req.body);
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      await deletePart(id);
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
