// lib/pdf/buildQuotePdf.js

import PDFDocument from 'pdfkit';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addVehicleTable } from './vehicleTable';
import { addItemsTable } from './itemsTable';
import { addTerms } from './terms';
import { addFooter } from './footer';

/**
 * Builds the quote PDF buffer with header, info boxes, vehicle, defect, items, terms, and footer.
 * @param {object} data - Full quote data including garage, client, vehicle, items, terms, defect_description.
 * @returns {Promise<Buffer>} - PDF buffer.
 */
export async function buildQuotePdf(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Footer on each new page
  doc.on('pageAdded', () => addFooter(doc));

  // Header
  addHeader(doc, data);

  // Company & Customer info
  addInfoBoxes(doc, data);

  // Vehicle table
  addVehicleTable(doc, data);

  // Reported Defect table
  if (data.defect_description) {
    const startY = doc.y;
    const tableWidth = doc.page.width - 80;

    // Defect header
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

  // Items table
  addItemsTable(doc, data);

  // Terms at bottom center
  addTerms(doc, data);

  // Footer on first page
  addFooter(doc);

  // Finalize
  doc.end();
  await new Promise(resolve => doc.on('end', resolve));
  return Buffer.concat(buffers);
}
