import { getQuoteById, updateQuote, deleteQuote } from '../../../services/quotesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const quote = await getQuoteById(id);
      return res.status(200).json(quote);
    }
    if (req.method === 'PUT') {
      const data = {
        customer_id: req.body.customer_id,
        fleet_id: req.body.fleet_id,
        job_id: req.body.job_id,
        vehicle_id: req.body.vehicle_id,
        customer_reference: req.body.customer_reference,
        po_number: req.body.po_number,
        total_amount: req.body.total_amount,
        status: req.body.status,
        terms: req.body.terms,
      };
      const updated = await updateQuote(id, data);
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      await deleteQuote(id);
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
