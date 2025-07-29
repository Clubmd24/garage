// pages/api/standards/[id].js
import pool from '../../../lib/db.js';
import apiHandler from '../../../lib/apiHandler.js';
import { getTokenFromReq } from '../../../lib/auth.js';

async function handler(req, res) {
  const { id } = req.query;
  
  // Check authentication
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Fetch questions for this standard
  const [rows] = await pool.query(
    `SELECT question_no AS no, question AS text, options, answer_index
       FROM quiz_questions
      WHERE standard_id = ?
      ORDER BY question_no`,
    [id]
  );

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ questions: rows });
}

export default apiHandler(handler);
