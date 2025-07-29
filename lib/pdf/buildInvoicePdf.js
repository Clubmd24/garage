import PDFDocument from 'pdfkit';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addItemsTable } from './itemsTable';
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
  items = [],
  terms = '',
}) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('pageAdded', () => addFooter(doc));

  addHeader(doc, { garage, quoteNumber: invoiceNumber, title: 'INVOICE' });
  addInfoBoxes(doc, { garage, client });

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
