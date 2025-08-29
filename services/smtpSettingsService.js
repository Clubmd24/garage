import pool from '../lib/db.js';

export async function getSmtpSettings() {
  const [[row]] = await pool.query(
    'SELECT id, host, port, username, password, secure, from_name, from_email FROM smtp_settings ORDER BY id LIMIT 1'
  );
  return row || null;
}

export async function upsertSmtpSettings({ host, port, username, password, secure, from_name, from_email }) {
  const current = await getSmtpSettings();
  if (current) {
    await pool.query(
      `UPDATE smtp_settings SET host=?, port=?, username=?, password=?, secure=?, from_name=?, from_email=? WHERE id=?`,
      [host || null, port || null, username || null, password || null, secure ? 1 : 0, from_name || null, from_email || null, current.id]
    );
    return { id: current.id, host, port, username, password, secure: !!secure, from_name, from_email };
  }
  const [{ insertId }] = await pool.query(
    `INSERT INTO smtp_settings (host, port, username, password, secure, from_name, from_email) VALUES (?,?,?,?,?,?,?)`,
    [host || null, port || null, username || null, password || null, secure ? 1 : 0, from_name || null, from_email || null]
  );
  return { id: insertId, host, port, username, password, secure: !!secure, from_name, from_email };
}
