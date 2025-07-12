import apiHandler from '../../../lib/apiHandler.js';
import pool from '../../../lib/db.js';
import { getIngestStatus } from '../../../services/standardIngestService.js';

async function handler(req, res) {
  // Auth check
  const secret = req.query.secret || req.headers['x-api-secret'];
  if (secret !== process.env.API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Only GET allowed
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Safe query: only select columns that actually exist
  let rows;
  try {
    [rows] = await pool.query(
      `SELECT 
         id,
         code,
         title AS source_name,
         pdf_url AS source_url
       FROM standards
       ORDER BY code`
    );
  } catch (err) {
    console.error('Standards status query failed:', err);
    return res.status(500).json({ error: 'internal_error' });
  }

  return res.status(200).json({
    running: getIngestStatus(),
    standards: rows
  });
}

export default apiHandler(handler);
