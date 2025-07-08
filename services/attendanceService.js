import pool from '../lib/db.js';

export async function listAttendance() {
  const [rows] = await pool.query(
    'SELECT id, employee_id, clock_in, clock_out FROM attendance_records ORDER BY id'
  );
  return rows;
}

export async function createAttendance({ employee_id, clock_in, clock_out }) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO attendance_records (employee_id, clock_in, clock_out) VALUES (?,?,?)',
    [employee_id || null, clock_in || null, clock_out || null]
  );
  return { id: insertId, employee_id, clock_in, clock_out };
}
