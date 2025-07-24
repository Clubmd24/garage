import { logFinish } from '../../../../services/jobWorkLogsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'POST') {
      const entry = await logFinish(id);
      return res.status(201).json(entry);
    }
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
