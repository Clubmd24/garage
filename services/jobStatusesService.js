import pool from '../lib/db.js';

export async function getJobStatuses() {
  const [rows] = await pool.query(
    'SELECT id, name FROM job_statuses ORDER BY id'
  );
  return rows;
}

export async function createJobStatus({ name }) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO job_statuses (name) VALUES (?)',
    [name]
  );
  return { id: insertId, name };
}

export async function deleteJobStatus(id) {
  const [[row]] = await pool.query(
    'SELECT name FROM job_statuses WHERE id=?',
    [id]
  );
  if (row && row.name === 'unassigned') {
    throw new Error('Cannot delete default status');
  }
  await pool.query('DELETE FROM job_statuses WHERE id=?', [id]);
  return { ok: true };
}

export async function jobStatusExists(name) {
  const [[row]] = await pool.query(
    'SELECT id FROM job_statuses WHERE name=?',
    [name]
  );
  return !!row;
}
