import * as service from '../../../services/quotesService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { fleet_id, customer_id } = req.query || {};
      if (fleet_id) {
        const rows = await service.getQuotesByFleet?.(fleet_id) ?? [];
        return res.status(200).json(rows);
      }
      if (customer_id) {
        const rows = await service.getQuotesByCustomer?.(customer_id) ?? [];
        return res.status(200).json(rows);
      }
      const quotes = await service.getAllQuotes();
      return res.status(200).json(quotes);
    }
    if (req.method === 'POST') {
      const newQuote = await service.createQuote(req.body);
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
