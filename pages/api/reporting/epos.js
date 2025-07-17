import { getEposReport } from '../../../services/posReportingService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { start, end } = req.query;
  const report = await getEposReport(start, end);
  return res.status(200).json(report);
}

export default apiHandler(handler);
