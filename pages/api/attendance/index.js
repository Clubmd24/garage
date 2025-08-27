import * as service from '../../../services/attendanceService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const { start_date, end_date, employee_id, current } = req.query;
    
    try {
      if (current === 'true') {
        // Get current attendance (who's clocked in)
        const currentAttendance = await service.getCurrentAttendance();
        return res.status(200).json(currentAttendance);
      } else if (start_date && end_date) {
        // Get attendance in date range
        const attendance = await service.getAttendanceInRange(start_date, end_date, employee_id);
        return res.status(200).json(attendance);
      } else if (employee_id) {
        // Get attendance for specific employee
        const attendance = await service.getAttendanceByEmployee(employee_id);
        return res.status(200).json(attendance);
      } else {
        // Get all attendance records
        const attendance = await service.getAllAttendanceRecords();
        return res.status(200).json(attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { action, employee_id, ...attendanceData } = req.body;
      
      if (action === 'clock_in') {
        const result = await service.clockIn(employee_id);
        return res.status(200).json(result);
      } else if (action === 'clock_out') {
        const result = await service.clockOut(employee_id);
        return res.status(200).json(result);
      } else {
        // Create manual attendance record
        const newRecord = await service.createAttendanceRecord(attendanceData);
        return res.status(201).json(newRecord);
      }
    } catch (error) {
      console.error('Error processing attendance action:', error);
      return res.status(500).json({ error: error.message || 'Failed to process attendance action' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { id, ...attendanceData } = req.body;
      const updatedRecord = await service.updateAttendanceRecord(id, attendanceData);
      return res.status(200).json(updatedRecord);
    } catch (error) {
      console.error('Error updating attendance record:', error);
      return res.status(500).json({ error: 'Failed to update attendance record' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await service.deleteAttendanceRecord(id);
      return res.status(200).json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      return res.status(500).json({ error: 'Failed to delete attendance record' });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
