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
    renderTerms(doc, quote.terms || company.quote_terms || company.terms);

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
    const base = invoice.terms || company.invoice_terms || company.terms;
    const bankParts = [
      company.bank_name,
      company.bank_sort_code && `Sort code: ${company.bank_sort_code}`,
      company.bank_account_number && `Account: ${company.bank_account_number}`,
      company.bank_iban && `IBAN: ${company.bank_iban}`,
    ]
      .filter(Boolean)
      .join('\n');
    const text = bankParts ? `${base}\n\n${bankParts}` : base;
    renderTerms(doc, text);

    doc.end();
  });
}

