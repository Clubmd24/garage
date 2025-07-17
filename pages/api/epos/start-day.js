import apiHandler from '../../../lib/apiHandler.js';
import { startSession, getActiveSession } from '../../../services/posSessionsService.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const session = await getActiveSession();
    return res.status(200).json(session);
  }
  if (req.method === 'POST') {
    const { float_amount } = req.body;
    const session = await startSession(float_amount || 0);
    return res.status(201).json(session);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
