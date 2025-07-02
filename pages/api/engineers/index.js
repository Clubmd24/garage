import { getAllEngineers, createEngineer } from '../../../services/engineersService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
    if (req.method === 'GET') {
      const engineers = await getAllEngineers();
      return res.status(200).json(engineers);
    }
    if (req.method === 'POST') {
      const newEngineer = await createEngineer(req.body);
      return res.status(201).json(newEngineer);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
