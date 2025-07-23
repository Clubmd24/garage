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
      start_2 = 0,
      start_1 = 0,
      start_0_50 = 0,
      start_0_20 = 0,
      start_0_10 = 0,
      start_0_05 = 0,
    } = req.body;
    const session = await startSession({
      start_50: parseInt(start_50) || 0,
      start_20: parseInt(start_20) || 0,
      start_10: parseInt(start_10) || 0,
      start_5: parseInt(start_5) || 0,
      start_2: parseInt(start_2) || 0,
      start_1: parseInt(start_1) || 0,
      start_0_50: parseInt(start_0_50) || 0,
      start_0_20: parseInt(start_0_20) || 0,
      start_0_10: parseInt(start_0_10) || 0,
      start_0_05: parseInt(start_0_05) || 0,
    });
    return res.status(201).json(session);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
