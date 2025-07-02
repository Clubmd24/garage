import { createQuoteItem, getQuoteItems } from '../../../services/quoteItemsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
    if (req.method === 'GET') {
      const items = await getQuoteItems(req.query.quote_id);
      return res.status(200).json(items);
    }
    if (req.method === 'POST') {
      const item = await createQuoteItem(req.body);
      return res.status(201).json(item);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
