import pool from '../lib/db-local.js';

export async function getAllShifts() {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.employee_id, s.start_time, s.end_time,
              u.username, u.email
       FROM shifts s
       JOIN users u ON s.employee_id = u.id
       ORDER BY s.start_time DESC`
    );
    return rows || [];
  } catch (error) {
    console.error('Error in getAllShifts:', error);
    return [];
  }
}

export async function getShiftsByEmployee(employeeId) {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.employee_id, s.start_time, s.end_time,
              u.username, u.email
       FROM shifts s
       JOIN users u ON s.employee_id = u.id
       WHERE s.employee_id = ?
       ORDER BY s.start_time DESC`,
      [employeeId]
    );
    return rows || [];
  } catch (error) {
    console.error('Error in getShiftsByEmployee:', error);
    return [];
  }
}

export async function getShiftsInRange(startDate, endDate, employeeId = null) {
  try {
    let query = `SELECT s.id, s.employee_id, s.start_time, s.end_time,
                        u.username, u.email
                 FROM shifts s
                 JOIN users u ON s.employee_id = u.id
                 WHERE s.start_time >= ? AND s.start_time <= ?`;
    
    const params = [startDate, endDate];
    
    if (employeeId) {
      query += ' AND s.employee_id = ?';
      params.push(employeeId);
    }
    
    query += ' ORDER BY s.start_time ASC';
    
    const [rows] = await pool.query(query, params);
    return rows || [];
  } catch (error) {
    console.error('Error in getShiftsInRange:', error);
    return [];
  }
}

export async function createShift(shiftData) {
  try {
    console.log('createShift called with data:', shiftData);
    
    const { employee_id, start_time, end_time } = shiftData;
    
    console.log('Extracted values:', { employee_id, start_time, end_time });
    console.log('Data types:', { 
      employee_id: typeof employee_id, 
      start_time: typeof start_time, 
      end_time: typeof end_time 
    });
    
    // Validate data types
    if (typeof employee_id !== 'number' || isNaN(employee_id)) {
      throw new Error(`Invalid employee_id: ${employee_id} (type: ${typeof employee_id})`);
    }
    
    if (typeof start_time !== 'string') {
      throw new Error(`Invalid start_time: ${start_time} (type: ${typeof start_time})`);
    }
    
    if (typeof end_time !== 'string') {
      throw new Error(`Invalid end_time: ${end_time} (type: ${typeof end_time})`);
    }
    
    console.log('Executing database query...');
    const [result] = await pool.query(
      `INSERT INTO shifts (employee_id, start_time, end_time)
       VALUES (?, ?, ?)`,
      [employee_id, start_time, end_time]
    );
    
    console.log('Database query result:', result);
    
    const newShift = { id: result.insertId, employee_id, start_time, end_time };
    console.log('Returning new shift:', newShift);
    
    return newShift;
  } catch (error) {
    console.error('Error in createShift:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

export async function updateShift(id, shiftData) {
  try {
    const { employee_id, start_time, end_time } = shiftData;
    
    await pool.query(
      `UPDATE shifts 
       SET employee_id = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [employee_id, start_time, end_time, id]
    );
    
    return { id, employee_id, start_time, end_time };
  } catch (error) {
    console.error('Error in updateShift:', error);
    throw error;
  }
}

export async function deleteShift(id) {
  try {
    await pool.query('DELETE FROM shifts WHERE id = ?', [id]);
    return { id };
  } catch (error) {
    console.error('Error in deleteShift:', error);
    throw error;
  }
}

export async function getWeeklyRota(weekStart) {
  try {
    // Calculate week end (7 days from start)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const [rows] = await pool.query(
      `SELECT s.id, s.employee_id, s.start_time, s.end_time,
              u.username, u.email
       FROM shifts s
       JOIN users u ON s.employee_id = u.id
       WHERE s.start_time >= ? AND s.start_time < ?
       ORDER BY s.start_time ASC, u.username ASC`,
      [weekStart, weekEnd]
    );
    
    return rows || [];
  } catch (error) {
    console.error('Error in getWeeklyRota:', error);
    return [];
  }
}

export async function duplicateWeeklyRota(sourceWeekStart, targetWeekStart) {
  try {
    // Get all shifts from source week
    const sourceWeekEnd = new Date(sourceWeekStart);
    sourceWeekEnd.setDate(sourceWeekEnd.getDate() + 7);
    
    const [sourceShifts] = await pool.query(
      'SELECT employee_id, start_time, end_time FROM shifts WHERE start_time >= ? AND start_time < ?',
      [sourceWeekStart, sourceWeekEnd]
    );
    
    // Calculate the difference in days between source and target weeks
    const daysDiff = Math.floor((new Date(targetWeekStart) - new Date(sourceWeekStart)) / (1000 * 60 * 60 * 24));
    
    // Create new shifts for target week
    const newShifts = [];
    for (const shift of sourceShifts) {
      const newStartTime = new Date(shift.start_time);
      newStartTime.setDate(newStartTime.getDate() + daysDiff);
      
      const newEndTime = new Date(shift.end_time);
      newEndTime.setDate(newEndTime.getDate() + daysDiff);
      
      const [result] = await pool.query(
        'INSERT INTO shifts (employee_id, start_time, end_time) VALUES (?, ?, ?)',
        [shift.employee_id, newStartTime, newEndTime]
      );
      
      newShifts.push({ id: result.insertId, employee_id: shift.employee_id, start_time: newStartTime, end_time: newEndTime });
    }
    
    return newShifts;
  } catch (error) {
    console.error('Error in duplicateWeeklyRota:', error);
    throw error;
  }
}
