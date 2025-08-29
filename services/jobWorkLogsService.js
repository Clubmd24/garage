import pool from '../lib/db-local.js';

export async function logStart(job_id) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO job_work_logs (job_id, action, ts) VALUES (?, "start", NOW())',
    [job_id]
  );
  const [[row]] = await pool.query(
    'SELECT id, job_id, action, ts FROM job_work_logs WHERE id=?',
    [insertId]
  );
  return row;
}

export async function logFinish(job_id) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO job_work_logs (job_id, action, ts) VALUES (?, "finish", NOW())',
    [job_id]
  );
  const [[row]] = await pool.query(
    'SELECT id, job_id, action, ts FROM job_work_logs WHERE id=?',
    [insertId]
  );
  return row;
}
