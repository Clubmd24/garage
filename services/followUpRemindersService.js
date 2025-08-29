import pool from '../lib/db.js';

export async function listReminders() {
  const [rows] = await pool.query(
    'SELECT id, quote_id, invoice_id, reminder_ts, sent_ts, status FROM follow_up_reminders ORDER BY reminder_ts DESC'
  );
  return rows;
}

export async function getReminder(id) {
  const [[row]] = await pool.query(
    'SELECT id, quote_id, invoice_id, reminder_ts, sent_ts, status FROM follow_up_reminders WHERE id=?',
    [id]
  );
  return row || null;
}

export async function createReminder({ quote_id, invoice_id, reminder_ts, status }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO follow_up_reminders (quote_id, invoice_id, reminder_ts, status) VALUES (?,?,?,?)`,
    [quote_id || null, invoice_id || null, reminder_ts || null, status || null]
  );
  return { id: insertId, quote_id, invoice_id, reminder_ts, status };
}

export async function updateReminder(id, { quote_id, invoice_id, reminder_ts, sent_ts, status }) {
  await pool.query(
    `UPDATE follow_up_reminders SET quote_id=?, invoice_id=?, reminder_ts=?, sent_ts=?, status=? WHERE id=?`,
    [quote_id || null, invoice_id || null, reminder_ts || null, sent_ts || null, status || null, id]
  );
  return { ok: true };
}

export async function deleteReminder(id) {
  await pool.query('DELETE FROM follow_up_reminders WHERE id=?', [id]);
  return { ok: true };
}

export async function scheduleDueReminders() {
  // create reminders for quotes older than 7 days without existing reminder
  await pool.query(
    `INSERT INTO follow_up_reminders (quote_id, reminder_ts, status)
     SELECT q.id, DATE_ADD(q.created_ts, INTERVAL 7 DAY), 'pending'
       FROM quotes q
       LEFT JOIN follow_up_reminders r ON r.quote_id = q.id
      WHERE q.created_ts <= DATE_SUB(NOW(), INTERVAL 7 DAY) AND r.id IS NULL`
  );
}
