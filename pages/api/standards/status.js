import apiHandler from '../../../lib/apiHandler.js';
import { getIngestStatus } from '../../../services/standardIngestService.js';

async function handler(req, res) {
  const secret = req.query.secret || req.headers['x-api-secret'];
  if (secret !== process.env.API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  res.status(200).json({ running: getIngestStatus() });
}

export default apiHandler(handler);
