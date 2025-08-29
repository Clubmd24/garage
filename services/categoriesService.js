import pool from '../lib/db-local.js';

export async function getAllCategories() {
  const [rows] = await pool.query(
    'SELECT id, name FROM part_categories ORDER BY name'
  );
  return rows;
}

export async function getCategoryById(id) {
  const [[row]] = await pool.query(
    'SELECT id, name FROM part_categories WHERE id=?',
    [id]
  );
  return row || null;
}

export async function createCategory({ name }) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO part_categories (name) VALUES (?)',
    [name]
  );
  return { id: insertId, name };
}

export async function updateCategory(id, { name }) {
  await pool.query(
    'UPDATE part_categories SET name=? WHERE id=?',
    [name, id]
  );
  return { ok: true };
}

export async function deleteCategory(id) {
  await pool.query('DELETE FROM part_categories WHERE id=?', [id]);
  return { ok: true };
}
