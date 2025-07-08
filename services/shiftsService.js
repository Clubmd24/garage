import pool from '../lib/db.js';

export async function listShifts() {
  const [rows] = await pool.query(
    'SELECT id, employee_id, start_time, end_time FROM shifts ORDER BY id'
  );
  return rows;
}

export async function createShift({ employee_id, start_time, end_time }) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO shifts (employee_id, start_time, end_time) VALUES (?,?,?)',
    [employee_id || null, start_time || null, end_time || null]
  );
  return { id: insertId, employee_id, start_time, end_time };
}
