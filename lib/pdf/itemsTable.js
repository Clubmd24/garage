// lib/pdf/itemsTable.js

/**
 * Draws the items table for the invoice PDF, with dynamic column widths:
 * - Numeric columns (Qty, Unit Price, Line Total) fixed to 9-character width
 * - Part Number sized to fit its content
 * - Description takes the rest
 *
 * @param {PDFKit.PDFDocument} doc
 * @param {object} data
 * @param {Array} data.items – Array of invoice items
 */
export function addItemsTable(doc, { items }) {
  // Basic measurements
  const startY = doc.y;
  const tableWidth = doc.page.width - 80; // 40px margins
  const rowHeight = 20;
  const padding = 5;

  // Setup font for measurements
  doc.font('Helvetica').fontSize(10);

  // 1) Numeric column width: 9 characters (roughly)
  const nineChars = '9'.repeat(9);
  const numericWidth = doc.widthOfString(nineChars) + padding * 2;

  // 2) Part Number column: measure header + all partNumber values
  let partColWidth = doc.widthOfString('Part Number') + padding * 2;
  items.forEach(it => {
    const w = doc.widthOfString(it.partNumber || '') + padding * 2;
    if (w > partColWidth) partColWidth = w;
  });

  // 3) Description gets remaining
  const descColWidth = tableWidth
    - partColWidth
    - numericWidth * 3;

  // Column order: [Part Number, Description, Qty, Unit Price, Line Total]
  const colWidths = [
    partColWidth,
    descColWidth,
    numericWidth,
    numericWidth,
    numericWidth
  ];

  // 4) Header row
  const headers = ['Part Number', 'Description', 'Qty', 'Unit Price', 'Line Total'];
  let x = 40;
  doc
    .rect(x, startY, tableWidth, rowHeight)
    .fill('#007bff')
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(10);

  headers.forEach((h, idx) => {
    doc.text(h, x + padding, startY + 5, { width: colWidths[idx] - padding * 2 });
    x += colWidths[idx];
  });

  // 5) Data rows
  let y = startY + rowHeight;
  doc.fillColor('#000').font('Helvetica').fontSize(10);

  items.forEach(it => {
    x = 40;
    // border
    doc.rect(x, y, tableWidth, rowHeight).stroke('#ddd');

    // Ensure numeric values are properly converted
    const qty = Number(it.qty) || 0;
    const unitPrice = Number(it.unit_price) || 0;
    const lineTotal = qty * unitPrice;

    const values = [
      it.partNumber || '',
      it.description || '',
      qty.toString(),
      unitPrice.toFixed(2),
      lineTotal.toFixed(2)
    ];

    values.forEach((txt, idx) => {
      doc.text(txt, x + padding, y + 5, { width: colWidths[idx] - padding * 2 });
      x += colWidths[idx];
    });

    y += rowHeight;
  });

  // 6) Move cursor below
  doc.y = y;

  // 7) Total Price line
  const totalPrice = items
    .reduce((sum, it) => {
      const qty = Number(it.qty) || 0;
      const unitPrice = Number(it.unit_price) || 0;
      return sum + (qty * unitPrice);
    }, 0)
    .toFixed(2);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Total Price', 40, doc.y + 10)
    .text(`$${totalPrice}`, 40 + partColWidth + descColWidth + padding, doc.y + 10, {
      width: numericWidth * 3 - padding,
      align: 'right'
    });

  doc.y += rowHeight;
}
