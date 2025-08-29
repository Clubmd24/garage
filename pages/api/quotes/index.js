import * as service from '../../../services/quotesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
    if (req.method === 'GET') {
      const { fleet_id, client_id, vehicle_id, job_id } = req.query || {};
      if (fleet_id) {
        const rows = await service.getQuotesByFleet?.(fleet_id) ?? [];
        return res.status(200).json(rows);
      }
      if (client_id) {
        const rows = await service.getQuotesByCustomer?.(client_id) ?? [];
        return res.status(200).json(rows);
      }
      if (vehicle_id) {
        const rows = await service.getQuotesByVehicle?.(vehicle_id) ?? [];
        return res.status(200).json(rows);
      }
      if (job_id) {
        const rows = await service.getQuotesByJob?.(job_id) ?? [];
        return res.status(200).json(rows);
      }
      const quotes = await service.getAllQuotes();
      return res.status(200).json(quotes);
    }
    if (req.method === 'POST') {
      const data = {
        client_id: req.body.client_id,
        fleet_id: req.body.fleet_id,
        job_id: req.body.job_id,
        vehicle_id: req.body.vehicle_id,
        company_vehicle_id: req.body.company_vehicle_id,
        reference: req.body.reference,
        purchase_order_number: req.body.purchase_order_number,
        description: req.body.description,
        total_amount: req.body.total_amount,
        status: req.body.status,
        terms: req.body.terms,
        revision: req.body.revision,
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
