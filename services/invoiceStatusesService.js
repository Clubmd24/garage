import pool from '../lib/db.js';

export async function getInvoiceStatuses() {
  const [rows] = await pool.query(
    'SELECT id, name FROM invoice_statuses ORDER BY id'
  );
  return rows;
}

export async function createInvoiceStatus({ name }) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO invoice_statuses (name) VALUES (?)',
    [name]
  );
  return { id: insertId, name };
}

export async function deleteInvoiceStatus(id) {
  const [[row]] = await pool.query(
    'SELECT name FROM invoice_statuses WHERE id=?',
    [id]
  );
  const mandatory = ['issued', 'paid', 'unpaid'];
  if (row && mandatory.includes(row.name)) {
    throw new Error('Cannot delete default status');
  }
  await pool.query('DELETE FROM invoice_statuses WHERE id=?', [id]);
  return { ok: true };
}

export async function invoiceStatusExists(name) {
  const [[row]] = await pool.query(
    'SELECT id FROM invoice_statuses WHERE name=?',
    [name]
  );
  return !!row;
}
