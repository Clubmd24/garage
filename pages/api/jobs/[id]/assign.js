import { assignUser, updateJob, getJobDetails } from '../../../../services/jobsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'POST') {
      const { engineer_id, scheduled_start, scheduled_end } = req.body || {};
      await assignUser(id, engineer_id);
      await updateJob(id, {
        status: 'awaiting assessment',
        scheduled_start,
        scheduled_end,
      });
      const job = await getJobDetails(id);
      return res.status(200).json(job);
    }
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
