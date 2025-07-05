import { getSettings } from '../../../../services/companySettingsService.js';
import { getQuoteById } from '../../../../services/quotesService.js';
import { getClientById } from '../../../../services/clientsService.js';
import { getVehicleById } from '../../../../services/vehiclesService.js';
import { getQuoteItems } from '../../../../services/quoteItemsService.js';
import pool from '../../../../lib/db.js';
import { buildQuotePdf } from '../../../../lib/pdf.js';
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
    const pdf = await buildQuotePdf({
      company,
      quote,
      client,
      vehicle: vehicle || {},
      items
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quote-${id}.pdf`);
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
