import { searchParts, createPart } from '../../../services/partsService';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { q } = req.query || {};
      const parts = await searchParts(q || '');
      return res.status(200).json(parts);
    }
    if (req.method === 'POST') {
      const { part_number, description, unit_cost, supplier_id } = req.body || {};
      const newPart = await createPart({
        part_number,
        description,
        unit_cost,
        supplier_id,
      });
      return res.status(201).json(newPart);
    }
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
