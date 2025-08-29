import pool from '../lib/db.js';

export async function listPayrollEntries(employee_id) {
  const base = 'SELECT id, employee_id, amount, pay_date FROM payroll_entries';
  const [rows] = employee_id
    ? await pool.query(`${base} WHERE employee_id=? ORDER BY id`, [employee_id])
    : await pool.query(`${base} ORDER BY id`);
  return rows;
}

export async function createPayrollEntry({ employee_id, amount, pay_date }) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO payroll_entries (employee_id, amount, pay_date) VALUES (?,?,?)',
    [employee_id || null, amount || 0, pay_date || null]
  );
  return { id: insertId, employee_id, amount, pay_date };
}
