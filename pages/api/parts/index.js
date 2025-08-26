import { searchParts, createPart } from '../../../services/partsService';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
    if (req.method === 'GET') {
      const { q } = req.query || {};
      const parts = await searchParts(q || '');
      return res.status(200).json(parts);
    }
    if (req.method === 'POST') {
      const { part_number, description, unit_cost, unit_sale_price, markup_percentage, supplier_id, category_id } = req.body || {};
      const newPart = await createPart({
        part_number,
        description,
        unit_cost,
        unit_sale_price,
        markup_percentage,
        supplier_id,
        category_id,
      });
      return res.status(201).json(newPart);
    }
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
