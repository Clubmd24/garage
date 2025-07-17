import { getCategoryById, updateCategory, deleteCategory } from '../../../services/categoriesService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const cat = await getCategoryById(id);
      return res.status(200).json(cat);
    }
    if (req.method === 'PUT') {
      const updated = await updateCategory(id, req.body);
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      await deleteCategory(id);
      return res.status(204).end();
    }
    res.setHeader('Allow', ['GET','PUT','DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
