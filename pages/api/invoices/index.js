import { getAllInvoices, createInvoice } from '../../../services/invoicesService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const invoices = await getAllInvoices();
      return res.status(200).json(invoices);
    }
    if (req.method === 'POST') {
      const newInvoice = await createInvoice(req.body);
      return res.status(201).json(newInvoice);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
