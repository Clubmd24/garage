import pool from '../lib/db.js';

export async function getAllAttendanceRecords() {
  const [rows] = await pool.query(
    `SELECT ar.id, ar.employee_id, ar.clock_in, ar.clock_out,
            u.username, u.first_name, u.last_name, u.employee_id as employee_number
     FROM attendance_records ar
     JOIN users u ON ar.employee_id = u.id
     ORDER BY ar.clock_in DESC`
  );
  return rows;
}

export async function getAttendanceByEmployee(employeeId) {
  const [rows] = await pool.query(
    `SELECT ar.id, ar.employee_id, ar.clock_in, ar.clock_out,
            u.username, u.first_name, u.last_name, u.employee_id as employee_number
     FROM attendance_records ar
     JOIN users u ON ar.employee_id = u.id
     WHERE ar.employee_id = ?
     ORDER BY ar.clock_in DESC`,
    [employeeId]
  );
  return rows;
}

export async function getAttendanceInRange(startDate, endDate, employeeId = null) {
  let query = `SELECT ar.id, ar.employee_id, ar.clock_in, ar.clock_out,
                      u.username, u.first_name, u.last_name, u.employee_id as employee_number
               FROM attendance_records ar
               JOIN users u ON ar.employee_id = u.id
               WHERE ar.clock_in >= ? AND ar.clock_in <= ?`;
  
  const params = [startDate, endDate];
  
  if (employeeId) {
    query += ' AND ar.employee_id = ?';
    params.push(employeeId);
  }
  
  query += ' ORDER BY ar.clock_in ASC';
  
  const [rows] = await pool.query(query, params);
  return rows;
}

export async function createAttendanceRecord(attendanceData) {
  const { employee_id, clock_in, clock_out } = attendanceData;
  
  const [result] = await pool.query(
    `INSERT INTO attendance_records (employee_id, clock_in, clock_out)
     VALUES (?, ?, ?)`,
    [employee_id, clock_in, clock_out]
  );
  
  return { id: result.insertId, employee_id, clock_in, clock_out };
}

export async function updateAttendanceRecord(id, attendanceData) {
  const { employee_id, clock_in, clock_out } = attendanceData;
  
  await pool.query(
    `UPDATE attendance_records 
     SET employee_id = ?, clock_in = ?, clock_out = ?
     WHERE id = ?`,
    [employee_id, clock_in, clock_out, id]
  );
  
  return { id, employee_id, clock_in, clock_out };
}

export async function deleteAttendanceRecord(id) {
  await pool.query('DELETE FROM attendance_records WHERE id = ?', [id]);
  return { id };
}

export async function clockIn(employeeId) {
  const now = new Date();
  
  // Check if employee already has an open clock-in record
  const [[existingRecord]] = await pool.query(
    'SELECT id FROM attendance_records WHERE employee_id = ? AND clock_out IS NULL',
    [employeeId]
  );
  
  if (existingRecord) {
    throw new Error('Employee already has an active clock-in session');
  }
  
  const [result] = await pool.query(
    'INSERT INTO attendance_records (employee_id, clock_in) VALUES (?, ?)',
    [employeeId, now]
  );
  
  return { id: result.insertId, employee_id: employeeId, clock_in: now };
}

export async function clockOut(employeeId) {
  const now = new Date();
  
  // Find the open clock-in record
  const [[record]] = await pool.query(
    'SELECT id FROM attendance_records WHERE employee_id = ? AND clock_out IS NULL',
    [employeeId]
  );
  
  if (!record) {
    throw new Error('No active clock-in session found for employee');
  }
  
  await pool.query(
    'UPDATE attendance_records SET clock_out = ? WHERE id = ?',
    [now, record.id]
  );
  
  return { id: record.id, employee_id: employeeId, clock_out: now };
}

export async function getAttendanceSummary(employeeId, startDate, endDate) {
  const [rows] = await pool.query(
    `SELECT 
       DATE(ar.clock_in) as date,
       MIN(ar.clock_in) as first_clock_in,
       MAX(ar.clock_out) as last_clock_out,
       SUM(TIMESTAMPDIFF(MINUTE, ar.clock_in, COALESCE(ar.clock_out, NOW()))) as total_minutes
     FROM attendance_records ar
     WHERE ar.employee_id = ? 
       AND ar.clock_in >= ? 
       AND ar.clock_in <= ?
     GROUP BY DATE(ar.clock_in)
     ORDER BY date`,
    [employeeId, startDate, endDate]
  );
  
  return rows.map(row => ({
    ...row,
    total_hours: Math.round((row.total_minutes / 60) * 100) / 100
  }));
}

export async function getCurrentAttendance() {
  const [rows] = await pool.query(
    `SELECT ar.id, ar.employee_id, ar.clock_in,
            u.username, u.first_name, u.last_name, u.employee_id as employee_number
     FROM attendance_records ar
     JOIN users u ON ar.employee_id = u.id
     WHERE ar.clock_out IS NULL
     ORDER BY ar.clock_in ASC`
  );
  
  return rows;
}
