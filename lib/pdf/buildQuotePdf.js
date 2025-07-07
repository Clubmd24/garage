// lib/pdf/buildQuotePdf.js

import PDFDocument from 'pdfkit';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addVehicleTable } from './vehicleTable';
import { addItemsTable } from './itemsTable';
import { addTerms } from './terms';
import { addFooter } from './footer';

/**
 * Builds the quote PDF buffer with:
 *  - Header
 *  - Company/Customer info
 *  - "VEHICLE INFORMATION" title + vehicle table
 *  - "JOB INFORMATION" title + defect table
 *  - "PARTS & LABOUR" title + items table
 *  - Terms (centered bottom)
 *  - Footer on every page (centered bottom)
 */
export async function buildQuotePdf(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Footer on each new page
  doc.on('pageAdded', () => addFooter(doc));

  // 1) Header + Info boxes
  addHeader(doc, data);
  addInfoBoxes(doc, data);

  // 2) VEHICLE INFORMATION
  doc
    .moveDown(1)
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('VEHICLE INFORMATION', { align: 'center' })
    .moveDown(0.5);
  addVehicleTable(doc, data);

  // 3) JOB INFORMATION (Reported Defect)
  doc
    .moveDown(1)
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('JOB INFORMATION', { align: 'center' })
    .moveDown(0.5);

  if (data.defect_description) {
    const startY = doc.y;
    const tableWidth = doc.page.width - 80;

    // Defect header bar
    doc
      .rect(40, startY, tableWidth, 20)
      .fill('#007bff')
      .fillColor('#fff')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Reported Defect', 45, startY + 5);

    // Defect body box
    const defect = data.defect_description;
    const bodyHeight = doc.heightOfString(defect, { width: tableWidth - 10 }) + 10;
    doc
      .fillColor('#000')
      .rect(40, startY + 20, tableWidth, bodyHeight)
      .stroke('#ddd')
      .text(defect, 45, startY + 25, { width: tableWidth - 10 });

    doc.moveDown(2);
  }

  // 4) PARTS & LABOUR (Items table)
  doc
    .moveDown(1)
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('PARTS & LABOUR', { align: 'center' })
    .moveDown(0.5);
  addItemsTable(doc, data);

  // 5) Terms and Footer
  // Terms centered 80px from bottom
  addTerms(doc, data);
  // Footer on first (or only) page
  addFooter(doc);

  // Finalize
  doc.end();
  await new Promise(r => doc.on('end', r));
  return Buffer.concat(buffers);
}
