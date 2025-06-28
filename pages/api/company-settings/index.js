import { getSettings, updateSettings } from '../../../services/companySettingsService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const settings = await getSettings();
      return res.status(200).json(settings);
    }
    if (req.method === 'PUT') {
      const updated = await updateSettings(req.body);
      return res.status(200).json(updated);
    }
    res.setHeader('Allow', ['GET','PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
