import pool from '../lib/db.js';

export async function startSession({
  start_50 = 0,
  start_20 = 0,
  start_10 = 0,
  start_5 = 0,
  start_2 = 0,
  start_1 = 0,
  start_0_50 = 0,
  start_0_20 = 0,
  start_0_10 = 0,
  start_0_05 = 0,
} = {}) {
  const float_amount =
    start_50 * 50 +
    start_20 * 20 +
    start_10 * 10 +
    start_5 * 5 +
    start_2 * 2 +
    start_1 * 1 +
    start_0_50 * 0.5 +
    start_0_20 * 0.2 +
    start_0_10 * 0.1 +
    start_0_05 * 0.05;
  const [{ insertId }] = await pool.query(
    `INSERT INTO pos_sessions (
      float_amount, start_50, start_20, start_10, start_5,
      start_2, start_1, start_0_50, start_0_20, start_0_10, start_0_05
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      float_amount,
      start_50,
      start_20,
      start_10,
      start_5,
      start_2,
      start_1,
      start_0_50,
      start_0_20,
      start_0_10,
      start_0_05,
    ]
  );
  const [[row]] = await pool.query(
    'SELECT * FROM pos_sessions WHERE id=?',
    [insertId]
  );
  return row;
}

export async function endSession(
  id,
  {
    end_50 = 0,
    end_20 = 0,
    end_10 = 0,
    end_5 = 0,
    end_2 = 0,
    end_1 = 0,
    end_0_50 = 0,
    end_0_20 = 0,
    end_0_10 = 0,
    end_0_05 = 0,
    pdq_total = 0,
  } = {}
) {
  const [[session]] = await pool.query('SELECT * FROM pos_sessions WHERE id=?', [id]);
  const totalCash =
    end_50 * 50 +
    end_20 * 20 +
    end_10 * 10 +
    end_5 * 5 +
    end_2 * 2 +
    end_1 * 1 +
    end_0_50 * 0.5 +
    end_0_20 * 0.2 +
    end_0_10 * 0.1 +
    end_0_05 * 0.05;
  const cash_total = totalCash - parseFloat(session.float_amount);
  const card_total = parseFloat(pdq_total);
  await pool.query(
    `UPDATE pos_sessions SET ended_at=NOW(),
      end_50=?, end_20=?, end_10=?, end_5=?,
      end_2=?, end_1=?, end_0_50=?, end_0_20=?, end_0_10=?, end_0_05=?,
      pdq_total=?, cash_total=?, card_total=?
      WHERE id=?`,
    [
      end_50,
      end_20,
      end_10,
      end_5,
      end_2,
      end_1,
      end_0_50,
      end_0_20,
      end_0_10,
      end_0_05,
      pdq_total,
      cash_total,
      card_total,
      id,
    ]
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
