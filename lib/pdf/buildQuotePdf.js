import PDFDocument from 'pdfkit';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addVehicleTable } from './vehicleTable';
import { addQuoteItemsTable } from './quoteItemsTable';
import { addTerms } from './terms';
import { addFooter } from './footer';

/** Convert mm → PDF points */
const mmToPt = mm => mm * 2.83465;

export async function buildQuotePdf(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Footer on new pages
  doc.on('pageAdded', () => addFooter(doc));

  // 1) Header + Info boxes
  addHeader(doc, data);
  addInfoBoxes(doc, data);

  // 2) VEHICLE INFORMATION
  // Move down 3 mm from current y
  doc.y += mmToPt(3);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('VEHICLE INFORMATION', 40, doc.y);
  // Gap of 3 mm before table
  doc.y += mmToPt(3);
  addVehicleTable(doc, data);

  // 3) JOB INFORMATION
  doc.y += mmToPt(3);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('JOB INFORMATION', 40, doc.y);
  doc.y += mmToPt(3);
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

    doc.y = startY + 20 + bodyHeight;
  }

  // 4) PARTS & LABOUR
  doc.y += mmToPt(3);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('PARTS & LABOUR', 40, doc.y);
  doc.y += mmToPt(3);
  addQuoteItemsTable(doc, data);

  // 5) Terms and Footer
  addTerms(doc, data);
  addFooter(doc);

  // Finish
  doc.end();
  await new Promise(r => doc.on('end', r));
  return Buffer.concat(buffers);
}
