import pool from '../lib/db-local.js';

export async function getAllApprentices() {
  const [rows] = await pool.query(
    'SELECT id, first_name, last_name, email, start_date, end_date, standard_id FROM apprentices ORDER BY id'
  );
  return rows;
}

export async function createApprentice({ first_name, last_name, email, start_date, end_date, standard_id }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO apprentices (first_name, last_name, email, start_date, end_date, standard_id)
     VALUES (?,?,?,?,?,?)`,
    [first_name, last_name, email, start_date || null, end_date || null, standard_id || null]
  );
  return { id: insertId, first_name, last_name, email, start_date, end_date, standard_id };
}
