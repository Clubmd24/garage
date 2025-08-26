import pool from '../lib/db.js';

export async function searchParts(query) {
  const q = `%${query}%`;
  const [rows] = query
    ? await pool.query(
        `SELECT id, part_number, description, unit_cost, unit_sale_price, markup_percentage, supplier_id, category_id
           FROM parts
          WHERE part_number LIKE ? OR description LIKE ?
          ORDER BY part_number
          LIMIT 20`,
        [q, q]
      )
    : await pool.query(
        `SELECT id, part_number, description, unit_cost, unit_sale_price, markup_percentage, supplier_id, category_id
           FROM parts
          ORDER BY part_number
          LIMIT 20`
      );
  return rows;
}

export async function createPart({
  part_number,
  description,
  unit_cost,
  unit_sale_price,
  markup_percentage,
  supplier_id,
  category_id,
}) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO parts (part_number, description, unit_cost, unit_sale_price, markup_percentage, supplier_id, category_id)
     VALUES (?,?,?,?,?,?,?)`,
    [part_number, description || null, unit_cost || null, unit_sale_price || null, markup_percentage || null, supplier_id || null, category_id || null]
  );
  return { id: insertId, part_number, description, unit_cost, unit_sale_price, markup_percentage, supplier_id, category_id };
}

export async function getPartById(id) {
  const [[row]] = await pool.query(
    `SELECT id, part_number, description, unit_cost, unit_sale_price, markup_percentage, supplier_id, category_id FROM parts WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function updatePart(id, { part_number, description, unit_cost, unit_sale_price, markup_percentage, supplier_id, category_id }) {
  await pool.query(
    `UPDATE parts SET part_number=?, description=?, unit_cost=?, unit_sale_price=?, markup_percentage=?, supplier_id=?, category_id=? WHERE id=?`,
    [part_number, description || null, unit_cost || null, unit_sale_price || null, markup_percentage || null, supplier_id || null, category_id || null, id]
  );
  return { ok: true };
}

export async function deletePart(id) {
  await pool.query('DELETE FROM parts WHERE id=?', [id]);
  return { ok: true };
}
