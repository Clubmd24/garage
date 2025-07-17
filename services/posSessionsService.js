import pool from '../lib/db.js';

export async function startSession(float_amount) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO pos_sessions (float_amount) VALUES (?)`,
    [float_amount]
  );
  const [[row]] = await pool.query(
    'SELECT * FROM pos_sessions WHERE id=?',
    [insertId]
  );
  return row;
}

export async function endSession(id, { cash_total, card_total }) {
  await pool.query(
    `UPDATE pos_sessions SET ended_at=NOW(), cash_total=?, card_total=? WHERE id=?`,
    [cash_total, card_total, id]
  );
  const [[row]] = await pool.query('SELECT * FROM pos_sessions WHERE id=?', [id]);
  return row;
}

export async function getActiveSession() {
  const [[row]] = await pool.query(
    'SELECT * FROM pos_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1'
  );
  return row || null;
}
