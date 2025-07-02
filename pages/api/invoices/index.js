import * as service from '../../../services/invoicesService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { customer_id, fleet_id, status } = req.query || {};
      if (fleet_id) {
        const rows = await service.getInvoicesByFleet?.(fleet_id, status) ?? [];
        return res.status(200).json(rows);
      }
      if (customer_id) {
        const rows = await service.getInvoicesByCustomer?.(customer_id, status) ?? [];
        return res.status(200).json(rows);
      }
      const invoices = await service.getAllInvoices();
      return res.status(200).json(invoices);
    }
    if (req.method === 'POST') {
      const newInvoice = await service.createInvoice(req.body);
      try {
        const { sendInvoiceEmail } = await import('../../../services/emailService.js');
        await sendInvoiceEmail(newInvoice.id);
      } catch (e) {
        console.error('INVOICE_EMAIL_ERROR:', e);
      }
      return res.status(201).json(newInvoice);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
