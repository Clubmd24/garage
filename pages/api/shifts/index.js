import * as service from '../../../services/shiftsService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const { start_date, end_date, employee_id, week_start } = req.query;
    
    try {
      console.log('Shifts API called with:', { start_date, end_date, employee_id, week_start });
      
      if (week_start) {
        // Get weekly rota
        console.log('Getting weekly rota for week starting:', week_start);
        const rota = await service.getWeeklyRota(week_start);
        console.log('Weekly rota result:', rota);
        return res.status(200).json(rota || []);
      } else if (start_date && end_date) {
        // Get shifts in date range
        console.log('Getting shifts in range:', start_date, 'to', end_date);
        const shifts = await service.getShiftsInRange(start_date, end_date, employee_id);
        console.log('Shifts in range result:', shifts);
        return res.status(200).json(shifts || []);
      } else if (employee_id) {
        // Get shifts for specific employee
        console.log('Getting shifts for employee:', employee_id);
        const shifts = await service.getShiftsByEmployee(employee_id);
        console.log('Employee shifts result:', shifts);
        return res.status(200).json(shifts || []);
      } else {
        // Get all shifts
        console.log('Getting all shifts');
        const shifts = await service.getAllShifts();
        console.log('All shifts result:', shifts);
        return res.status(200).json(shifts || []);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ 
        error: 'Failed to fetch shifts', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const shiftData = req.body;
      console.log('Received shift creation request with data:', shiftData);
      console.log('Request headers:', req.headers);
      
      // Validate required fields
      if (!shiftData.employee_id || !shiftData.start_time || !shiftData.end_time) {
        console.error('Missing required fields:', { 
          hasEmployeeId: !!shiftData.employee_id, 
          hasStartTime: !!shiftData.start_time, 
          hasEndTime: !!shiftData.end_time 
        });
        return res.status(400).json({ 
          error: 'Missing required fields', 
          details: 'employee_id, start_time, and end_time are required',
          received: shiftData
        });
      }
      
      console.log('Creating shift with validated data:', shiftData);
      const newShift = await service.createShift(shiftData);
      console.log('Shift created successfully:', newShift);
      
      return res.status(201).json(newShift);
    } catch (error) {
      console.error('Error creating shift:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ 
        error: 'Failed to create shift', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { id, ...shiftData } = req.body;
      const updatedShift = await service.updateShift(id, shiftData);
      return res.status(200).json(updatedShift);
    } catch (error) {
      console.error('Error updating shift:', error);
      return res.status(500).json({ error: 'Failed to update shift', details: error.message });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await service.deleteShift(id);
      return res.status(200).json({ message: 'Shift deleted successfully' });
    } catch (error) {
      console.error('Error deleting shift:', error);
      return res.status(500).json({ error: 'Failed to delete shift', details: error.message });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
