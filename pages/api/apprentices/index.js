import apiHandler from '../../../lib/apiHandler.js';
import { getAllApprentices, createApprentice } from '../../../services/apprenticesService.js';
import { CreateApprenticeSchema } from '../../../lib/schemas.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const apprentices = await getAllApprentices();
    return res.status(200).json(apprentices);
  }
  if (req.method === 'POST') {
    const data = CreateApprenticeSchema.parse(req.body);
    const apprentice = await createApprentice(data);
    return res.status(201).json(apprentice);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
