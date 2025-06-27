import pool from '../lib/db.js';

export async function getAllVehicles(customer_id) {
  const base = `SELECT v.id, v.licence_plate, v.make, v.model, v.color, v.customer_id, v.fleet_id,
                       CONCAT(c.first_name, ' ', c.last_name) AS customer_name
                  FROM vehicles v
             LEFT JOIN clients c ON v.customer_id=c.id`;
  const [rows] = customer_id
    ? await pool.query(`${base} WHERE v.customer_id=? ORDER BY v.id`, [customer_id])
    : await pool.query(`${base} ORDER BY v.id`);
  return rows;
}

export async function getVehicleById(id) {
  const [[row]] = await pool.query(
    `SELECT id, licence_plate, make, model, color, customer_id, fleet_id FROM vehicles WHERE id=?`,
    [id],
  );
  return row || null;
}

export async function createVehicle({ licence_plate, make, model, color, customer_id, fleet_id }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO vehicles (licence_plate, make, model, color, customer_id, fleet_id)
     VALUES (?,?,?,?,?,?)`,
    [licence_plate, make, model, color, customer_id || null, fleet_id || null],
  );
  return { id: insertId, licence_plate, make, model, color, customer_id, fleet_id };
}

export async function updateVehicle(id, { licence_plate, make, model, color, customer_id, fleet_id }) {
  await pool.query(
    `UPDATE vehicles SET licence_plate=?, make=?, model=?, color=?, customer_id=?, fleet_id=? WHERE id=?`,
    [licence_plate, make, model, color, customer_id || null, fleet_id || null, id],
  );
  return { ok: true };
}

export async function deleteVehicle(id) {
  await pool.query('DELETE FROM vehicles WHERE id=?', [id]);
  return { ok: true };
}
