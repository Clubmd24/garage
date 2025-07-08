import { deleteInvoiceStatus } from '../../../services/invoiceStatusesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'DELETE') {
      await deleteInvoiceStatus(id);
      return res.status(204).end();
    }
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
