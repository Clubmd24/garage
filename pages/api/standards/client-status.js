import withApiHandler from '../../../lib/apiHandler';
import pool from '../../../lib/db';

export default withApiHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get standards with question counts
    const [standards] = await pool.query(`
      SELECT 
        s.id,
        s.code,
        s.title,
        s.pdf_url as source_url,
        s.title as source_name,
        COALESCE(qc.question_count, 0) as generated_questions,
        10 as target_questions
      FROM standards s
      LEFT JOIN (
        SELECT standard_id, COUNT(*) as question_count
        FROM quiz_questions
        GROUP BY standard_id
      ) qc ON s.id = qc.standard_id
      ORDER BY s.code
    `);

    res.json({ standards });
  } catch (err) {
    console.error('Standards status query failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 