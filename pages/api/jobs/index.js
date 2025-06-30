import * as service from '../../../services/jobsService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { fleet_id, customer_id, status } = req.query || {};
      if (fleet_id) {
        const jobs = await service.getJobsByFleet?.(fleet_id, status) ?? [];
        return res.status(200).json(jobs);
      }
      if (customer_id) {
        const jobs = await service.getJobsByCustomer?.(customer_id, status) ?? [];
        return res.status(200).json(jobs);
      }
      const jobs = await service.getAllJobs(status);
      return res.status(200).json(jobs);
    }
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
