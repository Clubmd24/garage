import pool from '../lib/db.js';

export async function listTemplates() {
  const [rows] = await pool.query('SELECT id, name, subject, body, type FROM email_templates ORDER BY id');
  return rows;
}

export async function getTemplateById(id) {
  const [[row]] = await pool.query('SELECT id, name, subject, body, type FROM email_templates WHERE id=?', [id]);
  return row || null;
}

export async function createTemplate({ name, subject, body, type }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO email_templates (name, subject, body, type) VALUES (?,?,?,?)`,
    [name || null, subject || null, body || null, type || null]
  );
  return { id: insertId, name, subject, body, type };
}

export async function updateTemplate(id, { name, subject, body, type }) {
  await pool.query(
    `UPDATE email_templates SET name=?, subject=?, body=?, type=? WHERE id=?`,
    [name || null, subject || null, body || null, type || null, id]
  );
  return { ok: true };
}

export async function deleteTemplate(id) {
  await pool.query('DELETE FROM email_templates WHERE id=?', [id]);
  return { ok: true };
}
