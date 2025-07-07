import { addMileage, getMileageForVehicle } from '../../../services/vehicleMileageService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { vehicle_id } = req.query || {};
      const rows = await getMileageForVehicle(vehicle_id);
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const entry = await addMileage(req.body);
      return res.status(201).json(entry);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
