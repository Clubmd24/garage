import apiHandler from '../../../lib/apiHandler.js';
import pool from '../../../lib/db.js';

async function handler(req, res) {
  const secret = req.query.secret || req.headers['x-api-secret'];
  if (secret !== process.env.API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  const [rows] = await pool.query(
    `SELECT question_no AS no, question AS text
       FROM quiz_questions
      WHERE standard_id = ?
      ORDER BY question_no`,
    [id]
  );

  res.status(200).json({ questions: rows });
}

export default apiHandler(handler);
