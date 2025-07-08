import * as service from '../../../../services/shiftsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const shifts = await service.listShifts();
    return res.status(200).json(shifts);
  }
  if (req.method === 'POST') {
    const created = await service.createShift(req.body || {});
    return res.status(201).json(created);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
