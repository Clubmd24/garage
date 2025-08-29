import pool from '../lib/db-local.js';

export async function getRoles() {
  const [rows] = await pool.query(
    'SELECT id, name, description, developer, office, engineer, apprentice FROM roles ORDER BY id'
  );
  return rows;
}

export async function createRole({ name, description, developer, office, engineer, apprentice }) {
  const [{ insertId }] = await pool.query(
    'INSERT INTO roles (name, description, developer, office, engineer, apprentice) VALUES (?,?,?,?,?,?)',
    [name, description || null, developer ? 1 : 0, office ? 1 : 0, engineer ? 1 : 0, apprentice ? 1 : 0]
  );
  return { id: insertId, name, description, developer: !!developer, office: !!office, engineer: !!engineer, apprentice: !!apprentice };
}

export async function updateRole(id, { name, description, developer, office, engineer, apprentice }) {
  await pool.query(
    'UPDATE roles SET name=?, description=?, developer=?, office=?, engineer=?, apprentice=? WHERE id=?',
    [name, description || null, developer ? 1 : 0, office ? 1 : 0, engineer ? 1 : 0, apprentice ? 1 : 0, id]
  );
  return { id: Number(id), name, description, developer: !!developer, office: !!office, engineer: !!engineer, apprentice: !!apprentice };
}

export async function deleteRole(id) {
  await pool.query('DELETE FROM user_roles WHERE role_id=?', [id]);
  await pool.query('DELETE FROM roles WHERE id=?', [id]);
  return { ok: true };
}
