import apiHandler from '../../../lib/apiHandler.js';
import { endSession, getActiveSession } from '../../../services/posSessionsService.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getActiveSession();
    if (!session) return res.status(400).json({ error: 'no_session' });
    const {
      end_50 = 0,
      end_20 = 0,
      end_10 = 0,
      end_5 = 0,
      end_coins = 0,
      pdq_total = 0,
    } = req.body;
    const closed = await endSession(session.id, {
      end_50: parseInt(end_50) || 0,
      end_20: parseInt(end_20) || 0,
      end_10: parseInt(end_10) || 0,
      end_5: parseInt(end_5) || 0,
      end_coins: parseFloat(end_coins) || 0,
      pdq_total: parseFloat(pdq_total) || 0,
    });
    return res.status(200).json(closed);
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
