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
