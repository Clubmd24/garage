import * as service from '../../../services/shiftsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const { start_date, end_date, employee_id, week_start } = req.query;
    
    try {
      if (week_start) {
        // Get weekly rota
        const rota = await service.getWeeklyRota(week_start);
        return res.status(200).json(rota);
      } else if (start_date && end_date) {
        // Get shifts in date range
        const shifts = await service.getShiftsInRange(start_date, end_date, employee_id);
        return res.status(200).json(shifts);
      } else if (employee_id) {
        // Get shifts for specific employee
        const shifts = await service.getShiftsByEmployee(employee_id);
        return res.status(200).json(shifts);
      } else {
        // Get all shifts
        const shifts = await service.getAllShifts();
        return res.status(200).json(shifts);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      return res.status(500).json({ error: 'Failed to fetch shifts' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const shiftData = req.body;
      const newShift = await service.createShift(shiftData);
      return res.status(201).json(newShift);
    } catch (error) {
      console.error('Error creating shift:', error);
      return res.status(500).json({ error: 'Failed to create shift' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { id, ...shiftData } = req.body;
      const updatedShift = await service.updateShift(id, shiftData);
      return res.status(200).json(updatedShift);
    } catch (error) {
      console.error('Error updating shift:', error);
      return res.status(500).json({ error: 'Failed to update shift' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await service.deleteShift(id);
      return res.status(200).json({ message: 'Shift deleted successfully' });
    } catch (error) {
      console.error('Error deleting shift:', error);
      return res.status(500).json({ error: 'Failed to delete shift' });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
