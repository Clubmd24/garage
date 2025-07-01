import pool from '../lib/db.js';

export async function getAllFleets() {
  const [rows] = await pool.query(
    `SELECT id, company_name, account_rep, payment_terms,
            street_address, contact_number_1, contact_number_2,
            email_1, email_2, credit_limit, tax_number,
            contact_name_1, contact_name_2
       FROM fleets ORDER BY id`
  );
  return rows;
}

export async function getFleetById(id) {
  const [[row]] = await pool.query(
    `SELECT id, company_name, account_rep, payment_terms,
            street_address, contact_number_1, contact_number_2,
            email_1, email_2, credit_limit, tax_number,
            contact_name_1, contact_name_2
       FROM fleets WHERE id=?`,
    [id]
  );
  return row || null;
}
export async function createFleet({
  company_name,
  account_rep,
  payment_terms,
  street_address,
  contact_number_1,
  contact_number_2,
  email_1,
  email_2,
  credit_limit,
  tax_number,
  contact_name_1,
  contact_name_2,
}) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO fleets (
       company_name, account_rep, payment_terms,
       street_address, contact_number_1, contact_number_2,
       email_1, email_2, credit_limit, tax_number,
       contact_name_1, contact_name_2
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      company_name,
      account_rep || null,
      payment_terms || null,
      street_address || null,
      contact_number_1 || null,
      contact_number_2 || null,
      email_1 || null,
      email_2 || null,
      credit_limit || null,
      tax_number || null,
      contact_name_1 || null,
      contact_name_2 || null,
    ]
  );
  return {
    id: insertId,
    company_name,
    account_rep,
    payment_terms,
    street_address,
    contact_number_1,
    contact_number_2,
    email_1,
    email_2,
    credit_limit,
    tax_number,
    contact_name_1,
    contact_name_2,
  };
}

export async function updateFleet(
  id,
  {
    company_name,
    account_rep,
    payment_terms,
    street_address,
    contact_number_1,
    contact_number_2,
    email_1,
    email_2,
    credit_limit,
    tax_number,
    contact_name_1,
    contact_name_2,
  }
) {
  await pool.query(
    `UPDATE fleets SET
       company_name=?,
       account_rep=?,
       payment_terms=?,
       street_address=?,
       contact_number_1=?,
       contact_number_2=?,
       email_1=?,
       email_2=?,
       credit_limit=?,
       tax_number=?,
       contact_name_1=?,
       contact_name_2=?
     WHERE id=?`,
    [
      company_name,
      account_rep || null,
      payment_terms || null,
      street_address || null,
      contact_number_1 || null,
      contact_number_2 || null,
      email_1 || null,
      email_2 || null,
      credit_limit || null,
      tax_number || null,
      contact_name_1 || null,
      contact_name_2 || null,
      id,
    ]
  );
  return { ok: true };
}

export async function deleteFleet(id) {
  await pool.query('DELETE FROM fleets WHERE id=?', [id]);
  return { ok: true };
}

