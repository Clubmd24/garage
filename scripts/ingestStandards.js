#!/usr/bin/env node

import pool from '../lib/db.js';

async function fetchPdf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function ingestStandard({ name, url, version }) {
  // Download PDF to confirm URL works
  await fetchPdf(url);

  // Upsert into the standards table using the real columns
  await pool.query(
    `INSERT INTO standards (source_name, source_url, version, last_fetched_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       source_url = VALUES(source_url),
       version    = VALUES(version),
       last_fetched_at = NOW()`,
    [name, url, version]
  );

  console.log(`✅ Ingested standard ${name}@${version}`);
}

export default async function ingestAll() {
  const standards = [
    {
      name:    'Dummy PDF',
      url:     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      version: '1.0'
    },
    // add more { name, url, version } here
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
