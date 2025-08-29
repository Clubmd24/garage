import pool from '../lib/db-local.js';

export async function addMileage({ vehicle_id, mileage, recorded_at }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO vehicle_mileage (vehicle_id, mileage, recorded_at) VALUES (?,?,?)`,
    [vehicle_id, mileage, recorded_at || new Date()]
  );
  return { id: insertId, vehicle_id, mileage, recorded_at: recorded_at || new Date() };
}

export async function getMileageForVehicle(vehicle_id) {
  const [rows] = await pool.query(
    `SELECT id, vehicle_id, mileage, recorded_at FROM vehicle_mileage WHERE vehicle_id=? ORDER BY recorded_at DESC`,
    [vehicle_id]
  );
  return rows;
}
