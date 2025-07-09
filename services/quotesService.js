import pool from '../lib/db.js';

export async function getAllQuotes() {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, fleet_vehicle_id, customer_reference, po_number, defect_description, total_amount, status, terms, created_ts
       FROM quotes ORDER BY id`
  );
  return rows;
}

export async function getQuotesByFleet(fleet_id) {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, fleet_vehicle_id, customer_reference, po_number, defect_description, total_amount, status, terms, created_ts
       FROM quotes WHERE fleet_id=? ORDER BY id`,
    [fleet_id]
  );
  return rows;
}

export async function getQuotesByCustomer(customer_id) {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, fleet_vehicle_id, customer_reference, po_number, defect_description, total_amount, status, terms, created_ts
       FROM quotes WHERE customer_id=? ORDER BY id`,
    [customer_id]
  );
  return rows;
}

export async function getQuotesByVehicle(vehicle_id) {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, fleet_vehicle_id, customer_reference, po_number, defect_description, total_amount, status, terms, created_ts
       FROM quotes WHERE vehicle_id=? ORDER BY id`,
    [vehicle_id]
  );
  return rows;
}

export async function getQuotesByJob(job_id) {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, fleet_vehicle_id, customer_reference, po_number, defect_description, total_amount, status, terms, created_ts
       FROM quotes WHERE job_id=? ORDER BY id`,
    [job_id]
  );
  return rows;
}

export async function getQuoteById(id) {
  const [[row]] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, fleet_vehicle_id, customer_reference, po_number, defect_description, total_amount, status, terms, created_ts
       FROM quotes WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createQuote({
  customer_id,
  fleet_id,
  job_id,
  vehicle_id,
  fleet_vehicle_id,
  customer_reference,
  po_number,
  defect_description,
  total_amount,
  status,
  terms,
}) {
  if (fleet_vehicle_id === undefined) {
    if (vehicle_id) {
      const [[row]] = await pool.query(
        'SELECT company_vehicle_id FROM vehicles WHERE id=?',
        [vehicle_id]
      );
      fleet_vehicle_id = row?.company_vehicle_id ?? null;
    } else {
      fleet_vehicle_id = null;
    }
  }

  const [{ insertId }] = await pool.query(
    `INSERT INTO quotes
      (customer_id, fleet_id, job_id, vehicle_id, fleet_vehicle_id, customer_reference, po_number, defect_description, total_amount, status, terms)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      customer_id || null,
      fleet_id || null,
      job_id || null,
      vehicle_id || null,
      fleet_vehicle_id || null,
      customer_reference || null,
      po_number || null,
      defect_description || null,
      total_amount || null,
      status || null,
      terms || null,
    ]
  );
  return {
    id: insertId,
    customer_id,
    fleet_id,
    job_id,
    vehicle_id,
    fleet_vehicle_id,
    customer_reference,
    po_number,
    defect_description,
    total_amount,
    status,
    terms,
  };
}

export async function updateQuote(
  id,
  {
    customer_id,
    fleet_id,
    job_id,
    vehicle_id,
    fleet_vehicle_id,
    customer_reference,
    po_number,
    defect_description,
    total_amount,
    status,
    terms,
  }
) {
  if (fleet_vehicle_id === undefined) {
    if (vehicle_id) {
      const [[row]] = await pool.query(
        'SELECT company_vehicle_id FROM vehicles WHERE id=?',
        [vehicle_id]
      );
      fleet_vehicle_id = row?.company_vehicle_id ?? null;
    } else {
      fleet_vehicle_id = null;
    }
  }

  await pool.query(
    `UPDATE quotes SET
       customer_id=?,
       fleet_id=?,
       job_id=?,
       vehicle_id=?,
       fleet_vehicle_id=?,
       customer_reference=?,
       po_number=?,
       defect_description=?,
       total_amount=?,
       status=?,
       terms=?
     WHERE id=?`,
    [
      customer_id || null,
      fleet_id || null,
      job_id || null,
      vehicle_id || null,
      fleet_vehicle_id || null,
      customer_reference || null,
      po_number || null,
      defect_description || null,
      total_amount || null,
      status || null,
      terms || null,
      id,
    ]
  );
  return { ok: true };
}

export async function deleteQuote(id) {
  await pool.query('DELETE FROM quotes WHERE id=?', [id]);
  return { ok: true };
}
