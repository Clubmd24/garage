import pool from '../lib/db.js';

export async function createJobRequest({ fleet_id, client_id, vehicle_id, description }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO job_requests (fleet_id, client_id, vehicle_id, description)
     VALUES (?,?,?,?)`,
    [fleet_id || null, client_id || null, vehicle_id || null, description || null]
  );
  return { id: insertId, fleet_id, client_id, vehicle_id, description };
}

export async function getAllJobRequests() {
  const [rows] = await pool.query(
    `SELECT id, fleet_id, client_id, vehicle_id, description, created_at
       FROM job_requests ORDER BY id DESC`
  );
  return rows;
}
