import pool from '../lib/db.js';

export async function getDocuments(entity_type, entity_id) {
  const [rows] = await pool.query(
    `SELECT id, entity_type, entity_id, filename, url, uploaded_at
       FROM documents
      WHERE entity_type=? AND entity_id=?
      ORDER BY uploaded_at DESC`,
    [entity_type, entity_id]
  );
  return rows;
}

export async function createDocument({ entity_type, entity_id, filename, url }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO documents (entity_type, entity_id, filename, url)
     VALUES (?,?,?,?)`,
    [entity_type, entity_id, filename, url]
  );
  return { id: insertId, entity_type, entity_id, filename, url };
}
