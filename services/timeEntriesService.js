import pool from '../lib/db-local.js';

export async function listTimeEntries(job_id) {
  const [rows] = job_id
    ? await pool.query(
        `SELECT id, job_id, user_id, start_ts, end_ts, duration FROM time_entries WHERE job_id=? ORDER BY id`,
        [job_id]
      )
    : await pool.query(
        `SELECT id, job_id, user_id, start_ts, end_ts, duration FROM time_entries ORDER BY id`
      );
  return rows;
}

export async function clockIn(job_id, user_id) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO time_entries (job_id, user_id, start_ts) VALUES (?, ?, NOW())',
    [job_id, user_id]
  );
  const [[row]] = await pool.query(
    'SELECT id, job_id, user_id, start_ts, end_ts, duration FROM time_entries WHERE id=?',
    [insertId]
  );
  return row;
}

export async function clockOut(entry_id) {
  await pool.query(
    `UPDATE time_entries SET end_ts=NOW(), duration=TIMEDIFF(NOW(), start_ts) WHERE id=? AND end_ts IS NULL`,
    [entry_id]
  );
  const [[row]] = await pool.query(
    'SELECT id, job_id, user_id, start_ts, end_ts, duration FROM time_entries WHERE id=?',
    [entry_id]
  );
  return row || null;
}
