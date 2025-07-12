import pdf from 'pdf-parse';
import pool from '../lib/db.js';

export async function fetchPdf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function parseQuestions(text) {
  const lines = text.split(/\r?\n/);
  const questions = [];
  for (const line of lines) {
    const m = line.match(/^\d+\.\s*(.+)/);
    if (m) questions.push(m[1].trim());
  }
  return questions;
}

export async function ingestStandard({ code, url }) {
  const buffer = await fetchPdf(url);
  const { text } = await pdf(buffer);
  const title = text.split(/\n/)[0].trim();
  const [{ insertId }] = await pool.query(
    `INSERT INTO standards (code, title, pdf_url)
     VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE title=VALUES(title), pdf_url=VALUES(pdf_url)`,
    [code, title, url]
  );
  const [[row]] = await pool.query('SELECT id FROM standards WHERE code=?', [code]);
  const standardId = row.id || insertId;
  const questions = await parseQuestions(text);
  let no = 1;
  for (const q of questions) {
    await pool.query(
      `INSERT INTO quiz_questions (standard_id, question_no, question)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE question=VALUES(question)`,
      [standardId, no++, q]
    );
  }
}

export default async function ingestAll() {
  const standards = [
    // example list
    { code: 'STD001', url: 'https://example.com/std1.pdf' },
  ];
  for (const s of standards) {
    await ingestStandard(s);
  }
}

if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
  ingestAll().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}
