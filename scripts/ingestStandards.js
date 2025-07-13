#!/usr/bin/env node

import pool from '../lib/db.js';

// Download the PDF just to verify the URL is live
async function fetchPdf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function ingestStandard({ code, title, url }) {
  // 1) Check URL
  await fetchPdf(url);

  // 2) Upsert into your real schema: (code, title, pdf_url)
  await pool.query(
    `INSERT INTO standards (code, title, pdf_url)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title    = VALUES(title),
       pdf_url  = VALUES(pdf_url)`,
    [code, title, url]
  );

  console.log(`✅ ${code} — "${title}"`);
}

export default async function ingestAll() {
  const standards = [
    {
      code:  'STD001',
      title: 'NATEF A5 Brake Task List (Grenada NTA CVQ L2)',
      url:   'https://www.grenadanta.gd/wp-content/uploads/2021/04/Motor-Vehicle-Repairs-Cars-and-Light-Trucks-Level-2-final-NVQ.pdf'
    },
    {
      code:  'STD002',
      title: 'City & Guilds L2 Vehicle Maintenance & Repair Handbook',
      url:   'https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/automotive/4121/centre_documents/4101_4121_l1-l4_qualifications_handbook_v2-8-pdf.ashx'
    },
    {
      code:  'STD003',
      title: 'NVQ Level 2 Automobile Technician (Sri Lanka)',
      url:   'https://nvq.gov.lk/Report_Inquires/NCS_Request_Pdf.php?nm=G50S003_3_NCS.pdf'
    },
    {
      code:  'STD004',
      title: 'City & Guilds L2 Technical Certificate in Automotive (v8)',
      url:   'https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/light_vehicle_maintenance_and_hybrid_electric_vehicle_maintenance/4292/level_2/centre_documents/4292-21_l2_technical_certificate_qualification_handbook_v8-pdf.pdf'
    },
    {
      code:  'STD005',
      title: 'SA NQF Level 2: Automotive Repair & Maintenance',
      url:   'https://www.dhet.gov.za/National%20Certificates%20NQF%20Level%202/NC%28Vocational%29%20Assessment%20Guidelines%20Level%202/Engineering%20and%20Related%20Design/Automotive%20Repair%20and%20Maintenance%20L2%20AG.pdf'
    },
    {
      code:  'STD006',
      title: 'Pearson BTEC Level 2 Vehicle Technology',
      url:   'https://qualifications.pearson.com/content/dam/pdf/BTEC-Firsts/Vehicle-Technology/2012/Specification/BF033605-BTEC-L1-and-L2-Vehicle-Technology-Issue-3.pdf'
    },
    {
      code:  'STD007',
      title: 'William D. Ford CTC Automotive Technology II Syllabus (24-25)',
      url:   'https://www.wwcsd.net/downloads/william_d_ford/24-25_automotive_technology_ii_syllabus.pdf'
    },
  ];

  for (const std of standards) {
    await ingestStandard(std);
  }
  console.log('🎉 All standards ingested');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestAll()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('🚨 Ingestion failed:', err);
      process.exit(1);
    });
}
