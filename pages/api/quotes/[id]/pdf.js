import { getSettings } from '../../../../services/companySettingsService.js';
import { getQuoteById } from '../../../../services/quotesService.js';
import { getClientById } from '../../../../services/clientsService.js';
import { getVehicleById } from '../../../../services/vehiclesService.js';
import { getQuoteItems } from '../../../../services/quoteItemsService.js';
import pool from '../../../../lib/db.js';
import { buildQuotePdf } from '../../../../lib/pdf/buildQuotePdf';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const quote = await getQuoteById(id);
    if (!quote) return res.status(404).json({ error: 'Not Found' });
    const [jobRows] = quote.job_id
      ? await pool.query('SELECT vehicle_id FROM jobs WHERE id=?', [quote.job_id])
      : [[]];
    const vehicle = jobRows[0]?.vehicle_id ? await getVehicleById(jobRows[0].vehicle_id) : null;
    const company = await getSettings();
    const client = quote.customer_id ? await getClientById(quote.customer_id) : null;
    const items = await getQuoteItems(id);

    const quoteNumber = quote.id;
    const garage = {
      name: company?.company_name,
      logo: company?.logo_url,
      address: company?.address,
      phone: company?.phone,
      email: company?.email,
    };
    const clientInfo = client
      ? {
          name: `${client.first_name} ${client.last_name}`.trim(),
          phone: client.mobile || client.landline,
          email: client.email,
          address: client.street_address,
          city: client.town,
          postcode: client.post_code,
        }
      : {};
    const terms = quote.terms || company.terms || '';

    try {
      const pdf = await buildQuotePdf({
        quoteNumber,
        title: 'QUOTE',
        garage,
        client: clientInfo,
        vehicle: vehicle || {},
        items,
        defect_description: quote.defect_description,
        terms,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=quote-${id}.pdf`);
      res.send(pdf);
    } catch (err) {
      console.error('QUOTE_PDF_ERROR:', err);
      return res.status(500).json({ error: 'Failed to generate PDF' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
