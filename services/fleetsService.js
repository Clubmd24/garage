import pool from '../lib/db.js';

export async function getAllFleets() {
  const [rows] = await pool.query(
    `SELECT id, company_name, account_rep, payment_terms
       FROM fleets ORDER BY id`
  );
  return rows;
}

export async function getFleetById(id) {
  const [[row]] = await pool.query(
    `SELECT id, company_name, account_rep, payment_terms
       FROM fleets WHERE id=?`,
    [id]
  );
  return row || null;
}
export async function createFleet({ company_name, account_rep, payment_terms }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO fleets (company_name, account_rep, payment_terms)
     VALUES (?,?,?)`,
    [company_name, account_rep || null, payment_terms || null],
  );
  return { id: insertId, company_name, account_rep, payment_terms };
}

export async function updateFleet(id, { company_name, account_rep, payment_terms }) {
  await pool.query(
    `UPDATE fleets SET company_name=?, account_rep=?, payment_terms=? WHERE id=?`,
    [company_name, account_rep || null, payment_terms || null, id],
  );
  return { ok: true };
}

export async function deleteFleet(id) {
  await pool.query('DELETE FROM fleets WHERE id=?', [id]);
  return { ok: true };
}

