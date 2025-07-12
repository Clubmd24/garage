#!/usr/bin/env node

import pool from '../lib/db.js';

async function fetchPdf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function ingestStandard({ code, url }) {
  // Download PDF to confirm URL is reachable
  await fetchPdf(url);

  // Use the dummy PDF filename as title, or any placeholder
  const title = 'Dummy PDF';

  // Upsert into your actual columns: code, title, pdf_url
  await pool.query(
    `INSERT INTO standards (code, title, pdf_url)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title   = VALUES(title),
       pdf_url = VALUES(pdf_url)`,
    [code, title, url]
  );

  console.log(`✅ Ingested standard ${code}`);
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
