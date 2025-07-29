import apiHandler from '../../../lib/apiHandler.js';
import pool from '../../../lib/db.js';
import { getIngestStatus } from '../../../services/standardIngestService.js';
import { getTokenFromReq } from '../../../lib/auth.js';

async function handler(req, res) {
  // Check authentication
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // method check
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  let rows;
  try {
    [rows] = await pool.query(
      `SELECT
         s.id,
         s.code,
         s.title   AS source_name,
         s.pdf_url AS source_url,
         s.created_at,
         s.target_questions,
         COUNT(q.id) AS generated_questions
       FROM standards s
       LEFT JOIN quiz_questions q ON q.standard_id = s.id
       GROUP BY s.id
       ORDER BY s.id`
    );
  } catch (err) {
    console.error('Standards status query failed:', err);
    return res.status(500).json({ error: 'internal_error' });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    running: getIngestStatus(),
    standards: rows
  });
}

export default apiHandler(handler);
