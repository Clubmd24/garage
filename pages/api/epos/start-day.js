import apiHandler from '../../../lib/apiHandler.js';
import { startSession, getActiveSession } from '../../../services/posSessionsService.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const session = await getActiveSession();
    return res.status(200).json(session);
  }
  if (req.method === 'POST') {
    const {
      start_50 = 0,
      start_20 = 0,
      start_10 = 0,
      start_5 = 0,
      start_coins = 0,
    } = req.body;
    const session = await startSession({
      start_50: parseInt(start_50) || 0,
      start_20: parseInt(start_20) || 0,
      start_10: parseInt(start_10) || 0,
      start_5: parseInt(start_5) || 0,
      start_coins: parseFloat(start_coins) || 0,
    });
    return res.status(201).json(session);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
