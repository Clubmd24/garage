// File: lib/pdf/buildQuotePdf.js
import PDFDocument from 'pdfkit';
import AWS from 'aws-sdk';
import path from 'path';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addVehicleTable } from './vehicleTable';
import { addItemsTable } from './itemsTable';
import { addTerms } from './terms';
import { addFooter } from './footer';

const s3 = new AWS.S3();

export async function buildQuotePdf(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Fetch S3 logo if provided
  let logoBuffer;
  if (data.garage.logo && data.garage.logo.startsWith('s3://')) {
    const [, bucket, ...keyParts] = data.garage.logo.split('/');
    const Key = keyParts.join('/');
    const obj = await s3.getObject({ Bucket: bucket, Key }).promise();
    logoBuffer = obj.Body;
  }

  // Footer on all pages
  addFooter(doc);
  doc.on('pageAdded', () => addFooter(doc));

  // Header
  addHeader(doc, { ...data, logoBuffer });
  
  // Info boxes, vehicle, defect
  addInfoBoxes(doc, data);
  addVehicleTable(doc, data);
  if (data.defect_description) {
    doc.moveDown(1)
       .font('Helvetica-Bold').fontSize(12).text('Reported Defect:', { underline: true })
       .moveDown(0.5)
       .font('Helvetica').fontSize(10).text(data.defect_description)
       .moveDown(2);
  }

  // Items table and terms
  addItemsTable(doc, data);
  addTerms(doc, data);

  // Finalize
  doc.end();
  await new Promise(resolve => doc.on('end', resolve));
  return Buffer.concat(buffers);
}
