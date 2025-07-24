import { listReports, createReport } from '../../../../services/vehicleConditionReportsService.js';
import { getTokenFromReq } from '../../../../lib/auth.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const reports = await listReports(id);
      return res.status(200).json(reports);
    }
    if (req.method === 'POST') {
      const t = getTokenFromReq(req);
      const report = await createReport({
        job_id: id,
        user_id: t?.sub || null,
        description: req.body.description,
        photo_url: req.body.photo_url,
        none: req.body.none,
      });
      return res.status(201).json(report);
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
