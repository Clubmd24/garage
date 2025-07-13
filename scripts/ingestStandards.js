#!/usr/bin/env node
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js';
import pool from '../lib/db.js';

// Download the PDF and return a Uint8Array
async function fetchPdfAsUint8Array(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Pull all text out of a PDF Uint8Array via pdfjs-dist
async function pdfToText(dataUint8) {
  const loadingTask = getDocument({ data: dataUint8 });
  const doc = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(' ') + '\n';
  }
  return fullText;
}

// Naïve split on headings like "1. Title"
function splitSections(text) {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const sections = [];
  let buffer = [];
  let no = 1;

  for (const line of lines) {
    if (/^\d+\.\s+/.test(line) && buffer.length) {
      sections.push({ no: no++, content: buffer.join(' ') });
      buffer = [];
    }
    buffer.push(line);
  }
  if (buffer.length) sections.push({ no: no++, content: buffer.join(' ') });
  return sections;
}

async function ingestStandard({ code, title, url }) {
  console.log(`\n🔍 Ingesting ${code}`);
  const pdfData = await fetchPdfAsUint8Array(url);
  const text    = await pdfToText(pdfData);
  const secs    = splitSections(text);

  // upsert standard
  await pool.query(
    `INSERT INTO standards 
       (code, title, pdf_url, target_questions)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE
       title            = VALUES(title),
       pdf_url          = VALUES(pdf_url),
       target_questions = VALUES(target_questions)`,
    [code, title, url, secs.length]
  );

  // fetch its id
  const [[{ id: standardId }]] = await pool.query(
    `SELECT id FROM standards WHERE code = ?`, [code]
  );

  // clear old sections
  await pool.query(
    `DELETE FROM standard_sections WHERE standard_id = ?`, [standardId]
  );

  // insert each section
  for (const { no, content } of secs) {
    await pool.query(
      `INSERT INTO standard_sections
         (standard_id, section_no, section_text)
       VALUES (?,?,?)`,
      [standardId, no, content]
    );
  }

  console.log(`✅ ${code} → ${secs.length} sections`);
}

async function run() {
  const specs = [
    { code:'STD001', title:'NATEF A5 Brake Task List', url:'https://www.grenadanta.gd/wp-content/uploads/2021/04/Motor-Vehicle-Repairs-Cars-and-Light-Trucks-Level-2-final-NVQ.pdf' },
    { code:'STD002', title:'City & Guilds L2 Vehicle Maintenance & Repair Handbook', url:'https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/automotive/4121/centre_documents/4101_4121_l1-l4_qualifications_handbook_v2-8-pdf.ashx' },
    { code:'STD003', title:'NVQ L2 Automobile Technician (Sri Lanka)', url:'https://nvq.gov.lk/Report_Inquires/NCS_Request_Pdf.php?nm=G50S003_3_NCS.pdf' },
    { code:'STD004', title:'City & Guilds L2 Technical Certificate (v8)', url:'https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/light_vehicle_maintenance_and_hybrid_electric_vehicle_maintenance/4292/level_2/centre_documents/4292-21_l2_technical_certificate_qualification_handbook_v8-pdf.pdf' },
    { code:'STD005', title:'SA NQF L2 Repair & Maintenance AG', url:'https://www.dhet.gov.za/.../Automotive Repair and Maintenance L2 AG.pdf' },
    { code:'STD006', title:'Pearson BTEC L2 Vehicle Technology', url:'https://qualifications.pearson.com/.../BF033605-BTEC-L1-and-L2-Vehicle-Technology-Issue-3.pdf' },
    { code:'STD007', title:'WDF CTC Automotive Tech II Syllabus (24-25)', url:'https://www.wwcsd.net/downloads/william_d_ford/24-25_automotive_technology_ii_syllabus.pdf' },
  ];

  for (const std of specs) {
    await ingestStandard(std);
  }
  console.log('\n🎉 All standards ingested');
  await pool.end();
}

run().catch(err => {
  console.error('🚨 Ingestion error:', err);
  process.exit(1);
});
