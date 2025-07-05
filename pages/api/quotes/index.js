import * as service from '../../../services/quotesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
    if (req.method === 'GET') {
      const { fleet_id, customer_id, vehicle_id } = req.query || {};
      if (fleet_id) {
        const rows = await service.getQuotesByFleet?.(fleet_id) ?? [];
        return res.status(200).json(rows);
      }
      if (customer_id) {
        const rows = await service.getQuotesByCustomer?.(customer_id) ?? [];
        return res.status(200).json(rows);
      }
      if (vehicle_id) {
        const rows = await service.getQuotesByVehicle?.(vehicle_id) ?? [];
        return res.status(200).json(rows);
      }
      const quotes = await service.getAllQuotes();
      return res.status(200).json(quotes);
    }
    if (req.method === 'POST') {
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
      const newQuote = await service.createQuote(data);
      try {
        const { sendQuoteEmail } = await import('../../../services/emailService.js');
        await sendQuoteEmail(newQuote.id);
      } catch (e) {
        console.error('QUOTE_EMAIL_ERROR:', e);
      }
      return res.status(201).json(newQuote);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
