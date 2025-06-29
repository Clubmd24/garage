import pool from '../lib/db.js';

export async function searchParts(query) {
  const q = `%${query}%`;
  const [rows] = query
    ? await pool.query(
        `SELECT id, part_number, description, unit_cost
           FROM parts
          WHERE part_number LIKE ? OR description LIKE ?
          ORDER BY part_number
          LIMIT 20`,
        [q, q]
      )
    : await pool.query(
        `SELECT id, part_number, description, unit_cost
           FROM parts
          ORDER BY part_number
          LIMIT 20`
      );
  return rows;
}

export async function createPart({ part_number, description, unit_cost }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO parts (part_number, description, unit_cost)
     VALUES (?,?,?)`,
    [part_number, description || null, unit_cost || null]
  );
  return { id: insertId, part_number, description, unit_cost };
}
