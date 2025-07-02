import { getSettings, updateSettings } from '../../../services/companySettingsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
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
}

export default apiHandler(handler);
