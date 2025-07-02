import * as service from '../../../services/jobStatusesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
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
}

export default apiHandler(handler);
