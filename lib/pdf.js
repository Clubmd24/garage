import PDFDocument from 'pdfkit';

export async function buildQuotePdf({ company = {}, quote, client = {}, vehicle = {}, items = [] }) {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text(company.company_name || 'Quote', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    if (client.first_name || client.last_name) {
      doc.text(`${client.first_name || ''} ${client.last_name || ''}`);
    }
    if (vehicle.licence_plate) {
      doc.text(`Vehicle: ${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.licence_plate})`);
    }
    doc.moveDown();

    doc.text('Items:');
    items.forEach(it => {
      const line = `${it.description} x${it.qty} @ ${it.unit_price} = ${(it.qty * it.unit_price).toFixed(2)}`;
      doc.text(line);
    });
    doc.moveDown();
    doc.text(`Total: ${quote.total_amount}`);

    doc.end();
  });
}

export async function buildInvoicePdf({ company = {}, invoice, client = {}, items = [] }) {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text(company.company_name || 'Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    if (client.first_name || client.last_name) {
      doc.text(`${client.first_name || ''} ${client.last_name || ''}`);
    }
    doc.moveDown();

    doc.text('Items:');
    items.forEach(it => {
      const line = `${it.description} x${it.qty} @ ${it.unit_price} = ${(it.qty * it.unit_price).toFixed(2)}`;
      doc.text(line);
    });
    doc.moveDown();
    doc.text(`Total: ${invoice.amount}`);

    doc.end();
  });
}

