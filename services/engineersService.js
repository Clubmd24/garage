import pool from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';

export async function getAllEngineers() {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.email
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'engineer'
   ORDER BY u.username`
  );
  return rows;
}

export async function getEngineerById(id) {
  const [[row]] = await pool.query(
    `SELECT u.id, u.username, u.email
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'engineer' AND u.id=?`,
    [id]
  );
  return row || null;
}

export async function createEngineer({ username, email, password }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hashed = await hashPassword(password);
    const [{ insertId }] = await conn.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email || null, hashed]
    );
    const [[roleRow]] = await conn.query(
      'SELECT id FROM roles WHERE name = ?',
      ['engineer']
    );
    if (roleRow) {
      await conn.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [insertId, roleRow.id]
      );
    }
    await conn.commit();
    return { id: insertId, username, email: email || null };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateEngineer(id, { username, email, password }) {
  let sql = 'UPDATE users SET username=?, email=?';
  const params = [username, email || null];
  if (password) {
    sql += ', password_hash=?';
    const hashed = await hashPassword(password);
    params.push(hashed);
  }
  sql += ' WHERE id=?';
  params.push(id);
  await pool.query(sql, params);
  return { ok: true };
}

export async function deleteEngineer(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM user_roles WHERE user_id=?', [id]);
    await conn.query('DELETE FROM users WHERE id=?', [id]);
    await conn.commit();
    return { ok: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
