import withApiHandler from '../../../lib/apiHandler';
import pool from '../../../lib/db';

export default withApiHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Standard ID is required' });
  }

  try {
    // Get questions for the specified standard
    const [questions] = await pool.query(`
      SELECT 
        question_no as no,
        question_text as text,
        JSON_ARRAY(options_a, options_b, options_c, options_d) as options,
        correct_answer_index as answer_index
      FROM quiz_questions
      WHERE standard_id = ?
      ORDER BY question_no
    `, [id]);

    // Parse the JSON options array
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    res.json({ questions: parsedQuestions });
  } catch (err) {
    console.error('Questions query failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 