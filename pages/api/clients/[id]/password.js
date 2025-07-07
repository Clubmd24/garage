import { resetClientPassword } from '../../../../services/clientsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const password = await resetClientPassword(id);
  res.status(200).json({ password });
}

export default apiHandler(handler);
