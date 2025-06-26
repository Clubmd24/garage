import pool from '../lib/db.js';

export async function getAllClients() {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone FROM clients ORDER BY id'
  );
  return rows;
}

export async function getClientById(id) {
  const [[row]] = await pool.query(
    'SELECT id, name, email, phone FROM clients WHERE id=?',
    [id]
  );
  return row || null;
}

export async function createClient({ name, email, phone }) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO clients (name, email, phone) VALUES (?,?,?)',
    [name, email, phone]
  );
  return { id: insertId, name, email, phone };
}

export async function updateClient(id, { name, email, phone }) {
  await pool.query(
    'UPDATE clients SET name=?, email=?, phone=? WHERE id=?',
    [name, email, phone, id]
  );
  return { ok: true };
}

export async function deleteClient(id) {
  await pool.query('DELETE FROM clients WHERE id=?', [id]);
  return { ok: true };
}
