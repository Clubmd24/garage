import pool from '../lib/db.js';

export async function getAllSuppliers() {
  const [rows] = await pool.query(
    `SELECT id, name, address, contact_number, email_address, payment_terms, credit_limit
       FROM suppliers ORDER BY id`
  );
  return rows;
}

export async function getSupplierById(id) {
  const [[row]] = await pool.query(
    `SELECT id, name, address, contact_number, email_address, payment_terms, credit_limit
       FROM suppliers WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createSupplier({ name, address, contact_number, email_address, payment_terms, credit_limit }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO suppliers (name, address, contact_number, email_address, payment_terms, credit_limit)
     VALUES (?,?,?,?,?,?)`,
    [name, address || null, contact_number || null, email_address || null, payment_terms || null, credit_limit || null]
  );
  return { id: insertId, name, address, contact_number, email_address, payment_terms, credit_limit };
}

export async function updateSupplier(id, { name, address, contact_number, email_address, payment_terms, credit_limit }) {
  await pool.query(
    `UPDATE suppliers SET
       name=?,
       address=?,
       contact_number=?,
       email_address=?,
       payment_terms=?,
       credit_limit=?
     WHERE id=?`,
    [name, address || null, contact_number || null, email_address || null, payment_terms || null, credit_limit || null, id]
  );
  return { ok: true };
}

export async function deleteSupplier(id) {
  await pool.query('DELETE FROM suppliers WHERE id=?', [id]);
  return { ok: true };
}
