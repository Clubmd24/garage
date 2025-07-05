import { getQuoteItemById, updateQuoteItem } from '../../../services/quoteItemsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const item = await getQuoteItemById(id);
      return res.status(200).json(item);
    }
    if (req.method === 'PUT') {
      const updated = await updateQuoteItem(id, req.body);
      return res.status(200).json(updated);
    }
    res.setHeader('Allow', ['GET','PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
