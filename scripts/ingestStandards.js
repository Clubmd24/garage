#!/usr/bin/env node

import pdfParse from 'pdf-parse';
import pool from '../lib/db.js';

async function fetchPdf(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function parseQuestions(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const title = lines.find((l) => l) || 'Untitled';
  const questions = [];
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s*(.+)/);
    if (m) questions.push(m[2]);
  }
  return { title, questions };
}

export async function ingestStandard({ code, url }) {
  try {
    const buf = await fetchPdf(url);
    const { text } = await pdfParse(buf);
    const { title, questions } = parseQuestions(text);

    await pool.query(
      `INSERT INTO standards (code, title, pdf_url)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title   = VALUES(title),
         pdf_url = VALUES(pdf_url)`,
      [code, title, url]
    );

    const [[standard]] = await pool.query(
      'SELECT id FROM standards WHERE code = ? LIMIT 1',
      [code]
    );

    await pool.query('DELETE FROM quiz_questions WHERE standard_id = ?', [standard.id]);

    if (questions.length) {
      const values = questions.map((q, i) => [standard.id, i + 1, q]);
      await pool.query(
        'INSERT INTO quiz_questions (standard_id, question_no, question) VALUES ?',
        [values]
      );
    }

    console.log(`✅ Ingested standard ${code}`);
  } catch (err) {
    console.error(`❌ Failed to ingest ${code}:`, err);
    throw err;
  }
}

export default async function ingestAll() {
  const standards = [
    {
      code: 'STD001',
      url:  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    // …add more {code,url} here
  ];

  for (const s of standards) {
    await ingestStandard(s);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestAll()
    .then(() => {
      console.log('🎉 All standards ingested.');
      process.exit(0);
    })
    .catch(err => {
      console.error('🚨 Ingestion failed:', err);
      process.exit(1);
    });
}
