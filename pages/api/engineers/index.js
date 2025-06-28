import { getAllEngineers, createEngineer } from '../../../services/engineersService.js';

export default async function handler(req, res) {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
