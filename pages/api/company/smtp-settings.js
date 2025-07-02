import { getSmtpSettings, upsertSmtpSettings } from '../../../services/smtpSettingsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
    if (req.method === 'GET') {
      const settings = await getSmtpSettings();
      return res.status(200).json(settings);
    }
    if (req.method === 'PUT') {
      const updated = await upsertSmtpSettings(req.body);
      return res.status(200).json(updated);
    }
    res.setHeader('Allow', ['GET','PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
