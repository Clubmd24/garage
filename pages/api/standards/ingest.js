import apiHandler from '../../../lib/apiHandler.js';
import { ingestStandards } from '../../../services/standardIngestService.js';
import { getTokenFromReq } from '../../../lib/auth.js';

async function handler(req, res) {
  // Check authentication
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  ingestStandards().catch(() => {});
  res.status(202).json({ started: true });
}

export default apiHandler(handler);
