import { resetFleetPin } from '../../../../services/fleetsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const pin = await resetFleetPin(id);
  res.status(200).json({ pin });
}

export default apiHandler(handler);
