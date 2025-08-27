import * as service from '../../../../services/shiftsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const shifts = await service.getAllShifts();
    return res.status(200).json(shifts);
  }
  if (req.method === 'POST') {
    const created = await service.createShift(req.body || {});
    return res.status(201).json(created);
  }
  if (req.method === 'PUT') {
    const { id, ...data } = req.body || {};
    const updated = await service.updateShift(id, data);
    return res.status(200).json(updated);
  }
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    await service.deleteShift(id);
    return res.status(204).end();
  }
  res.setHeader('Allow', ['GET','POST','PUT','DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
