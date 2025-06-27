import { getVehicleById, updateVehicle, deleteVehicle } from '../../../services/vehiclesService';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const vehicle = await getVehicleById(id);
      return res.status(200).json(vehicle);
    }
    if (req.method === 'PUT') {
      const updated = await updateVehicle(id, req.body);
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      await deleteVehicle(id);
      return res.status(204).end();
    }
    res.setHeader('Allow', ['GET','PUT','DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
