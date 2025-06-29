import { getAllVehicles, createVehicle } from '../../../services/vehiclesService';

export default async function handler(req, res) {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
