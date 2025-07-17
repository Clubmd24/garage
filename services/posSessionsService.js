import pool from '../lib/db.js';

export async function startSession({ start_50 = 0, start_20 = 0, start_10 = 0, start_5 = 0, start_coins = 0 } = {}) {
  const float_amount =
    start_50 * 50 +
    start_20 * 20 +
    start_10 * 10 +
    start_5 * 5 +
    parseFloat(start_coins);
  const [{ insertId }] = await pool.query(
    `INSERT INTO pos_sessions (float_amount, start_50, start_20, start_10, start_5, start_coins) VALUES (?,?,?,?,?,?)`,
    [float_amount, start_50, start_20, start_10, start_5, start_coins]
  );
  const [[row]] = await pool.query(
    'SELECT * FROM pos_sessions WHERE id=?',
    [insertId]
  );
  return row;
}

export async function endSession(
  id,
  { end_50 = 0, end_20 = 0, end_10 = 0, end_5 = 0, end_coins = 0, pdq_total = 0 } = {}
) {
  const [[session]] = await pool.query('SELECT * FROM pos_sessions WHERE id=?', [id]);
  const totalCash =
    end_50 * 50 +
    end_20 * 20 +
    end_10 * 10 +
    end_5 * 5 +
    parseFloat(end_coins);
  const cash_total = totalCash - parseFloat(session.float_amount);
  const card_total = parseFloat(pdq_total);
  await pool.query(
    `UPDATE pos_sessions SET ended_at=NOW(), end_50=?, end_20=?, end_10=?, end_5=?, end_coins=?, pdq_total=?, cash_total=?, card_total=? WHERE id=?`,
    [end_50, end_20, end_10, end_5, end_coins, pdq_total, cash_total, card_total, id]
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
