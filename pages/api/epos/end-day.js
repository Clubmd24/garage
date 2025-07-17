import apiHandler from '../../../lib/apiHandler.js';
import { endSession, getActiveSession } from '../../../services/posSessionsService.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getActiveSession();
    if (!session) return res.status(400).json({ error: 'no_session' });
    const { cash_total, card_total } = req.body;
    const closed = await endSession(session.id, { cash_total, card_total });
    return res.status(200).json(closed);
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
