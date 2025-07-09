import apiHandler from '../../lib/apiHandler.js';
import { masterSearch } from '../../services/masterSearchService.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const q = req.query.q || '';
    const results = await masterSearch(q);
    return res.status(200).json(results);
  }
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
