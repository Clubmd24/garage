import pool from '../lib/db-local.js';

export async function getAllVehicles(customer_id, fleet_id) {
  const base = `SELECT v.id, v.licence_plate, v.make, v.model, v.color,
                       v.vin_number, v.company_vehicle_id, v.customer_id, v.fleet_id,
                       v.service_date, v.itv_date,
                       CONCAT(c.first_name, ' ', c.last_name) AS customer_name
                  FROM vehicles v
             LEFT JOIN clients c ON v.customer_id=c.id`;
  const [rows] = customer_id
    ? await pool.query(`${base} WHERE v.customer_id=? ORDER BY v.id`, [customer_id])
    : fleet_id
    ? await pool.query(`${base} WHERE v.fleet_id=? ORDER BY v.id`, [fleet_id])
    : await pool.query(`${base} ORDER BY v.id`);
  return rows;
}

export async function getVehicleById(id) {
  const [[row]] = await pool.query(
    `SELECT id, licence_plate, make, model, color, vin_number, company_vehicle_id, customer_id, fleet_id, service_date, itv_date FROM vehicles WHERE id=?`,
    [id],
  );
  return row || null;
}

export async function createVehicle({
  licence_plate,
  make,
  model,
  color,
  vin_number,
  company_vehicle_id,
  customer_id,
  fleet_id,
  service_date,
  itv_date,
}) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO vehicles (
       licence_plate, make, model, color, vin_number,
       company_vehicle_id, customer_id, fleet_id,
       service_date, itv_date
     ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      licence_plate,
      make,
      model,
      color,
      vin_number || null,
      company_vehicle_id || null,
      customer_id || null,
      fleet_id || null,
      service_date || null,
      itv_date || null,
    ],
  );
  return {
    id: insertId,
    licence_plate,
    make,
    model,
    color,
    vin_number,
    company_vehicle_id,
    customer_id,
    fleet_id,
    service_date,
    itv_date,
  };
}

export async function updateVehicle(
  id,
  { licence_plate, make, model, color, vin_number, company_vehicle_id, customer_id, fleet_id, service_date, itv_date }
) {
  await pool.query(
    `UPDATE vehicles SET licence_plate=?, make=?, model=?, color=?, vin_number=?, company_vehicle_id=?, customer_id=?, fleet_id=?, service_date=?, itv_date=? WHERE id=?`,
    [
      licence_plate,
      make,
      model,
      color,
      vin_number || null,
      company_vehicle_id || null,
      customer_id || null,
      fleet_id || null,
      service_date || null,
      itv_date || null,
      id,
    ],
  );
  return { ok: true };
}

export async function deleteVehicle(id) {
  await pool.query('DELETE FROM vehicles WHERE id=?', [id]);
  return { ok: true };
}
