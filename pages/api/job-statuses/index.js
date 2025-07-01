import * as service from '../../../services/jobStatusesService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const statuses = await service.getJobStatuses();
      return res.status(200).json(statuses);
    }
    if (req.method === 'POST') {
      const status = await service.createJobStatus(req.body);
      return res.status(201).json(status);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
