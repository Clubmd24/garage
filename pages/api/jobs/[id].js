import * as service from '../../../services/jobsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const job = await service.getJobDetails
        ? service.getJobDetails(id)
        : null;
      if (!job) return res.status(404).json({ error: 'Not Found' });
      return res.status(200).json(job);
    }
    if (req.method === 'PUT') {
      const updated = await service.updateJob(id, req.body);
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      try {
        await service.deleteJob(id);
        return res.status(204).end();
      } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
      }
    }
    res.setHeader('Allow', ['GET','PUT','DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
