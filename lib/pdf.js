import PDFDocument from 'pdfkit';

function renderHeader(doc, title, { client = {}, vehicle = {} } = {}) {
  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  if (client.first_name || client.last_name) {
    doc.text(`${client.first_name || ''} ${client.last_name || ''}`);
  }
  if (vehicle.licence_plate) {
    const vin = vehicle.vin_number ? ` VIN: ${vehicle.vin_number}` : '';
    doc.text(`Vehicle: ${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.licence_plate})${vin}`);
  }
  doc.moveDown();
}

function renderItemsTable(doc, items = []) {
  doc.text('Items:');
  items.forEach(it => {
    const line = `${it.description} x${it.qty} @ ${it.unit_price} = ${(it.qty * it.unit_price).toFixed(2)}`;
    doc.text(line);
  });
  doc.moveDown();
}

function renderFooter(doc, label, total) {
  doc.text(`${label}: ${total}`);
}

function renderTerms(doc, terms) {
  if (!terms) return;
  doc.moveDown();
  doc.fontSize(10).text(terms);
}

export async function buildQuotePdf({ company = {}, quote, client = {}, vehicle = {}, items = [] }) {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    renderHeader(doc, company.company_name || 'Quote', { client, vehicle });
    renderItemsTable(doc, items);
    renderFooter(doc, 'Total', quote.total_amount);
    renderTerms(doc, quote.terms || company.terms);

    doc.end();
  });
}

export async function buildInvoicePdf({ company = {}, invoice, client = {}, items = [] }) {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    renderHeader(doc, company.company_name || 'Invoice', { client });
    renderItemsTable(doc, items);
    renderFooter(doc, 'Total', invoice.amount);
    renderTerms(doc, invoice.terms || company.terms);

    doc.end();
  });
}

