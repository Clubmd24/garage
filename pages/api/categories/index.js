import { getAllCategories, createCategory } from '../../../services/categoriesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const rows = await getAllCategories();
    return res.status(200).json(rows);
  }
  if (req.method === 'POST') {
    const created = await createCategory(req.body);
    return res.status(201).json(created);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
