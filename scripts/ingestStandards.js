#!/usr/bin/env node

import pool from '../lib/db.js';

async function fetchPdf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  // We only verify reachability here — parsing happens later
  return Buffer.from(await res.arrayBuffer());
}

export async function ingestStandard({ name, url, version }) {
  // 1. Download PDF to confirm URL works
  await fetchPdf(url);

  // 2. Upsert into your actual standards table schema
  await pool.query(
    `INSERT INTO standards (source_name, source_url, version, last_fetched_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       source_url      = VALUES(source_url),
       version         = VALUES(version),
       last_fetched_at = NOW()`,
    [name, url, version]
  );

  console.log(`✅ Ingested standard "${name}" (v${version})`);
}

export default async function ingestAll() {
  // ── Drop in your real syllabus URLs here ──
  const standards = [
    {
      name:    'NATEF A5 Brake Task List (Grenada NTA CVQ L2)',
      url:     'https://www.grenadanta.gd/wp-content/uploads/2021/04/Motor-Vehicle-Repairs-Cars-and-Light-Trucks-Level-2-final-NVQ.pdf',
      version: '2021'
    },
    {
      name:    'City & Guilds L2 Vehicle Maintenance & Repair Handbook',
      url:     'https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/automotive/4121/centre_documents/4101_4121_l1-l4_qualifications_handbook_v2-8-pdf.ashx',
      version: 'v2.8'
    },
    {
      name:    'NVQ Level 2 Automobile Technician (Sri Lanka)',
      url:     'https://nvq.gov.lk/Report_Inquires/NCS_Request_Pdf.php?nm=G50S003_3_NCS.pdf',
      version: '2023'
    },
    {
      name:    'City & Guilds L2 Technical Certificate in Automotive',
      url:     'https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/light_vehicle_maintenance_and_hybrid_electric_vehicle_maintenance/4292/level_2/centre_documents/4292-21_l2_technical_certificate_qualification_handbook_v8-pdf.pdf',
      version: 'v8'
    },
    {
      name:    'SA NQF Level 2: Automotive Repair & Maintenance',
      url:     'https://www.dhet.gov.za/National%20Certificates%20NQF%20Level%202/NC%28Vocational%29%20Assessment%20Guidelines%20Level%202/Engineering%20and%20Related%20Design/Automotive%20Repair%20and%20Maintenance%20L2%20AG.pdf',
      version: '2013'
    },
    {
      name:    'Pearson BTEC Level 2 Vehicle Technology',
      url:     'https://qualifications.pearson.com/content/dam/pdf/BTEC-Firsts/Vehicle-Technology/2012/Specification/BF033605-BTEC-L1-and-L2-Vehicle-Technology-Issue-3.pdf',
      version: 'Issue 3'
    },
    {
      name:    'William D. Ford CTC Automotive Technology II Syllabus',
      url:     'https://www.wwcsd.net/downloads/william_d_ford/24-25_automotive_technology_ii_syllabus.pdf',
      version: '2024–25'
    },
  ];

  for (const s of standards) {
    await ingestStandard(s);
  }

  console.log('🎉 All standards ingested.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestAll()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('🚨 Ingestion failed:', err);
      process.exit(1);
    });
}
