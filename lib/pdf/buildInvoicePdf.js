import PDFDocument from 'pdfkit';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addItemsTable } from './itemsTable';
import { addVehicleTable } from './vehicleTable';
import { addFooter } from './footer';

function addInvoiceTerms(doc, text) {
  const y = doc.page.height - 80;
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#000')
    .text('Invoice Terms and Payment Details', 0, y, {
      align: 'center',
      width: doc.page.width - 80,
    })
    .moveDown(0.5)
    .font('Helvetica')
    .fontSize(8)
    .text(text, {
      align: 'center',
      width: doc.page.width - 80,
    });
}

const mmToPt = mm => mm * 2.83465;

export async function buildInvoicePdf({
  invoiceNumber,
  garage,
  client = {},
  vehicle = {},
  items = [],
  defect_description = '',
  terms = '',
  generatedDate,
}) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('pageAdded', () => addFooter(doc));

  addHeader(doc, { garage, quoteNumber: invoiceNumber, title: 'INVOICE', generatedDate });
  addInfoBoxes(doc, { garage, client });

  // VEHICLE INFORMATION
  doc.y += mmToPt(3);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('VEHICLE INFORMATION', 40, doc.y);
  doc.y += mmToPt(3);
  addVehicleTable(doc, { vehicle });

  // JOB INFORMATION
  doc.y += mmToPt(3);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('JOB INFORMATION', 40, doc.y);
  doc.y += mmToPt(3);
  if (defect_description) {
    const startY = doc.y;
    const tableWidth = doc.page.width - 80;

    doc
      .rect(40, startY, tableWidth, 20)
      .fill('#007bff')
      .fillColor('#fff')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Reported Defect', 45, startY + 5);

    const bodyHeight =
      doc.heightOfString(defect_description, { width: tableWidth - 10 }) + 10;
    doc
      .fillColor('#000')
      .rect(40, startY + 20, tableWidth, bodyHeight)
      .stroke('#ddd')
      .text(defect_description, 45, startY + 25, { width: tableWidth - 10 });

    doc.y = startY + 20 + bodyHeight;
  }

  doc.y += mmToPt(3);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#007bff')
    .text('ITEMS', 40, doc.y);
  doc.y += mmToPt(3);
  addItemsTable(doc, { items });

  addInvoiceTerms(doc, terms);
  addFooter(doc);

  doc.end();
  await new Promise(r => doc.on('end', r));
  return Buffer.concat(buffers);
}
