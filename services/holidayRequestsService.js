import pool from '../lib/db.js';

export async function listRequests(employee_id) {
  const [rows] = employee_id
    ? await pool.query(
        `SELECT id, employee_id, start_date, end_date, status, created_ts
           FROM holiday_requests WHERE employee_id=? ORDER BY id`,
        [employee_id]
      )
    : await pool.query(
        `SELECT id, employee_id, start_date, end_date, status, created_ts
           FROM holiday_requests ORDER BY id`
      );
  return rows;
}

export async function submitRequest({ employee_id, start_date, end_date, status }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO holiday_requests (employee_id, start_date, end_date, status)
     VALUES (?,?,?,?)`,
    [employee_id || null, start_date || null, end_date || null, status || 'pending']
  );
  return { id: insertId, employee_id, start_date, end_date, status: status || 'pending' };
}
