import * as service from '../../../../services/payrollService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const entries = await service.listPayrollEntries();
    return res.status(200).json(entries);
  }
  if (req.method === 'POST') {
    const created = await service.createPayrollEntry(req.body || {});
    return res.status(201).json(created);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
