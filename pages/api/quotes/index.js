import { getAllQuotes, createQuote } from '../../../services/quotesService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const quotes = await getAllQuotes();
      return res.status(200).json(quotes);
    }
    if (req.method === 'POST') {
      const newQuote = await createQuote(req.body);
      return res.status(201).json(newQuote);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
