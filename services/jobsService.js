import pool from '../lib/db.js';
import { JOB_STATUSES } from '../lib/jobStatuses.js';

export async function getAllJobs(status) {
  const base =
    'SELECT id, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay, created_at FROM jobs';
  const [rows] = status
    ? await pool.query(`${base} WHERE status=? ORDER BY id`, [status])
    : await pool.query(`${base} ORDER BY id`);
  return rows;
}

export async function getJobsByFleet(fleet_id, status) {
  const base =
    `SELECT j.id, j.customer_id, j.vehicle_id, j.scheduled_start, j.scheduled_end, j.status, j.bay, j.created_at
       FROM jobs j
       JOIN vehicles v ON j.vehicle_id = v.id
      WHERE v.fleet_id=?`;
  const [rows] = status
    ? await pool.query(`${base} AND j.status=? ORDER BY j.id`, [fleet_id, status])
    : await pool.query(`${base} ORDER BY j.id`, [fleet_id]);
  return rows;
}

export async function getJobsByCustomer(customer_id, status) {
  const base =
    `SELECT id, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay, created_at FROM jobs WHERE customer_id=?`;
  const [rows] = status
    ? await pool.query(`${base} AND status=? ORDER BY id`, [customer_id, status])
    : await pool.query(`${base} ORDER BY id`, [customer_id]);
  return rows;
}

export async function getJobById(id) {
  const [[row]] = await pool.query(
    `SELECT id, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay, created_at
       FROM jobs WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createJob({ customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay }) {
  if (status && !JOB_STATUSES.includes(status)) {
    throw new Error('Invalid job status');
  }
  const [{ insertId }] = await pool.query(
    `INSERT INTO jobs (customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay)
     VALUES (?,?,?,?,?,?)`,
    [customer_id || null, vehicle_id || null, scheduled_start || null, scheduled_end || null, status || null, bay || null]
  );
  return { id: insertId, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay };
}

export async function updateJob(id, { customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay }) {
  if (status && !JOB_STATUSES.includes(status)) {
    throw new Error('Invalid job status');
  }
  await pool.query(
    `UPDATE jobs SET customer_id=?, vehicle_id=?, scheduled_start=?, scheduled_end=?, status=?, bay=? WHERE id=?`,
    [customer_id || null, vehicle_id || null, scheduled_start || null, scheduled_end || null, status || null, bay || null, id]
  );
  return { ok: true };
}

export async function deleteJob(id) {
  await pool.query('DELETE FROM jobs WHERE id=?', [id]);
  return { ok: true };
}

export async function getAssignments(job_id) {
  const [rows] = await pool.query(
    `SELECT id, job_id, user_id, assigned_at FROM job_assignments WHERE job_id=? ORDER BY id`,
    [job_id]
  );
  return rows;
}

export async function assignUser(job_id, user_id) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO job_assignments (job_id, user_id) VALUES (?, ?)',
    [job_id, user_id]
  );
  return { id: insertId, job_id, user_id };
}

export async function removeAssignment(id) {
  await pool.query('DELETE FROM job_assignments WHERE id=?', [id]);
  return { ok: true };
}

export async function listActiveJobsForEngineer(user_id) {
  const [rows] = await pool.query(
    `SELECT j.id, j.customer_id, j.vehicle_id, j.scheduled_start, j.scheduled_end,
            j.status, j.bay, j.created_at
       FROM jobs j
       JOIN job_assignments ja ON j.id = ja.job_id
      WHERE ja.user_id=? AND j.status='in progress'
      ORDER BY j.id`,
    [user_id]
  );
  return rows;
}
