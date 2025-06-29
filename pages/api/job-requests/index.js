import { createJobRequest, getAllJobRequests } from '../../../services/jobRequestsService.js';
import { verifyToken, getTokenFromReq } from '../../../lib/auth.js';
import { parse } from 'cookie';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const t = getTokenFromReq(req);
      if (!t) return res.status(401).json({ error: 'Unauthorized' });
      const requests = await getAllJobRequests();
      return res.status(200).json(requests);
    }
    if (req.method === 'POST') {
      const cookies = parse(req.headers.cookie || '');
      const token = cookies.fleet_token || cookies.local_token;
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      let payload;
      try {
        payload = verifyToken(token);
      } catch {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { vehicle_id, description } = req.body || {};
      const data = {
        fleet_id: payload.fleet_id || null,
        client_id: payload.client_id || null,
        vehicle_id,
        description,
      };
      const reqRec = await createJobRequest(data);
      return res.status(201).json(reqRec);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
