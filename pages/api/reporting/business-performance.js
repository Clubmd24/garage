import { getBusinessPerformanceReport } from '../../../services/reportingService.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const { start, end } = req.query;
    const report = await getBusinessPerformanceReport(start, end);
    return res.status(200).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
