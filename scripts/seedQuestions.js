import fs from 'fs';
import path from 'path';
import pool from '../lib/db.js';

const dataPath = path.resolve('data/questionBank.json');
const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

for (const q of questions) {
  const [[standard]] = await pool.query(
    'SELECT id FROM standards WHERE code = ? LIMIT 1',
    [q.standard]
  );
  if (!standard) {
    console.warn(`Standard code ${q.standard} not found, skipping question ${q.no}`);
    continue;
  }

  await pool.query(
    `INSERT INTO quiz_questions (standard_id, question_no, question)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE question = VALUES(question)`,
    [standard.id, q.no, q.text]
  );
}

console.log(`\u2705 Seeded ${questions.length} questions`);
await pool.end();
