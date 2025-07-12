import apiHandler from '../../../lib/apiHandler.js';
import pool from '../../../lib/db.js';
import { getIngestStatus } from '../../../services/standardIngestService.js';

async function handler(req, res) {
  const secret = req.query.secret || req.headers['x-api-secret'];
  if (secret !== process.env.API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Select the columns you actually have in your standards table:
  const [rows] = await pool.query(
    `SELECT
       id,
       code,
       title AS source_name,
       pdf_url AS source_url,
       last_fetched_at
     FROM standards
     ORDER BY code`
  );

  res.status(200).json({
    running: getIngestStatus(),
    standards: rows
  });
}

export default apiHandler(handler);
