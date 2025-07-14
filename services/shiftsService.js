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

export async function updateShift(id, data = {}) {
  const fields = [];
  const params = [];
  for (const key of ['employee_id', 'start_time', 'end_time']) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      fields.push(`${key}=?`);
      params.push(data[key] ?? null);
    }
  }
  if (fields.length) {
    const sql = `UPDATE shifts SET ${fields.join(', ')} WHERE id=?`;
    params.push(id);
    await pool.query(sql, params);
  }
  return { ok: true };
}

export async function deleteShift(id) {
  await pool.query('DELETE FROM shifts WHERE id=?', [id]);
  return { ok: true };
}
