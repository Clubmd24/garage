import { getAllJobs } from '../../../services/jobsService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const jobs = await getAllJobs();
      return res.status(200).json(jobs);
    }
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
