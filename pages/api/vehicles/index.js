import { getAllVehicles, createVehicle } from '../../../services/vehiclesService';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
    if (req.method === 'GET') {
      const { customer_id, fleet_id } = req.query || {};
      const vehicles = await getAllVehicles(customer_id, fleet_id);
      return res.status(200).json(vehicles);
    }
    if (req.method === 'POST') {
      const newVehicle = await createVehicle(req.body);
      return res.status(201).json(newVehicle);
    }
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
