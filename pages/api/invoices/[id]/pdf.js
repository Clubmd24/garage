import { getSettings } from '../../../../services/companySettingsService.js';
import { getInvoiceById } from '../../../../services/invoicesService.js';
import { getClientById } from '../../../../services/clientsService.js';
import { getInvoiceItems } from '../../../../services/invoiceItemsService.js';
import { buildInvoicePdf } from '../../../../lib/pdf.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const invoice = await getInvoiceById(id);
    if (!invoice) return res.status(404).json({ error: 'Not Found' });
    const company = await getSettings();
    const client = invoice.customer_id ? await getClientById(invoice.customer_id) : null;
    const items = await getInvoiceItems(id);
    const pdf = await buildInvoicePdf({
      company,
      invoice,
      client,
      items
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
