import * as service from '../../../services/jobsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
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
    if (req.method === 'POST') {
      const job = await service.createJob(req.body);
      return res.status(201).json(job);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
