import pool from '../lib/db-local.js';
import { searchParts } from './partsService.js';

export async function masterSearch(query) {
  const like = `%${query}%`;

  const [clients] = await pool.query(
    `SELECT id, first_name, last_name, email, mobile, landline
       FROM clients
      WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
         OR mobile LIKE ? OR landline LIKE ? OR garage_name LIKE ? OR vehicle_reg LIKE ?
      ORDER BY first_name, last_name
      LIMIT 20`,
    [like, like, like, like, like, like, like]
  );

  const [vehicles] = await pool.query(
    `SELECT id, licence_plate, make, model, vin_number
       FROM vehicles
      WHERE licence_plate LIKE ? OR make LIKE ? OR model LIKE ? OR vin_number LIKE ?
      ORDER BY licence_plate
      LIMIT 20`,
    [like, like, like, like]
  );

  const [quotes] = await pool.query(
    `SELECT id FROM quotes WHERE CAST(id AS CHAR) LIKE ? ORDER BY id LIMIT 20`,
    [like]
  );

  const [jobs] = await pool.query(
    `SELECT id FROM jobs WHERE CAST(id AS CHAR) LIKE ? ORDER BY id LIMIT 20`,
    [like]
  );

  const [invoices] = await pool.query(
    `SELECT id FROM invoices WHERE CAST(id AS CHAR) LIKE ? ORDER BY id LIMIT 20`,
    [like]
  );

  const parts = await searchParts(query);

  return { clients, vehicles, quotes, jobs, invoices, parts };
}
