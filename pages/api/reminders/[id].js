import { getReminder, updateReminder, deleteReminder } from '../../../services/followUpRemindersService.js';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const row = await getReminder(id);
      return res.status(200).json(row);
    }
    if (req.method === 'PUT') {
      const updated = await updateReminder(id, req.body);
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      await deleteReminder(id);
      return res.status(204).end();
    }
    res.setHeader('Allow', ['GET','PUT','DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
