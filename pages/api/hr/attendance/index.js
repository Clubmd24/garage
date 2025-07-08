import * as service from '../../../../services/attendanceService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const records = await service.listAttendance();
    return res.status(200).json(records);
  }
  if (req.method === 'POST') {
    const created = await service.createAttendance(req.body || {});
    return res.status(201).json(created);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
