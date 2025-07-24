import pool from '../lib/db.js';

export async function listReports(job_id) {
  const [rows] = await pool.query(
    'SELECT id, job_id, user_id, description, photo_url, created_at FROM vehicle_condition_reports WHERE job_id=? ORDER BY id',
    [job_id]
  );
  return rows;
}

export async function createReport({ job_id, user_id, description, photo_url, none }) {
  if (none) {
    await pool.query('UPDATE jobs SET condition_checked=1 WHERE id=?', [job_id]);
    return { ok: true };
  }
  const [{ insertId }] = await pool.query(
    'INSERT INTO vehicle_condition_reports (job_id, user_id, description, photo_url) VALUES (?,?,?,?)',
    [job_id, user_id || null, description || null, photo_url || null]
  );
  await pool.query('UPDATE jobs SET condition_checked=1 WHERE id=?', [job_id]);
  const [[row]] = await pool.query(
    'SELECT id, job_id, user_id, description, photo_url, created_at FROM vehicle_condition_reports WHERE id=?',
    [insertId]
  );
  return row;
}
