/**
 * Draws the items table for the quote PDF, showing only customer-facing columns.
 * @param {PDFKit.PDFDocument} doc
 * @param {object} data
 * @param {Array} data.items - Array of quote items.
 */
export function addItemsTable(doc, { items }) {
  const headers = ['Part Number', 'Description', 'Qty', 'Unit Price', 'Line Total'];
  const startY = doc.y;
  const tableWidth = doc.page.width - 80;
  const rowHeight = 20;
  const colCount = headers.length;
  const colWidth = tableWidth / colCount;

  // Header exactly at startY
  doc
    .rect(40, startY, tableWidth, rowHeight)
    .fill('#007bff')
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(10);

  headers.forEach((h, i) => {
    doc.text(h, 40 + i * colWidth + 5, startY + 5, {
      width: colWidth - 10
    });
  });

  // Rows immediately below header
  let y = startY + rowHeight;
  doc.fillColor('#000').font('Helvetica').fontSize(10);

  items.forEach(it => {
    const unitPrice = it.unit_price.toFixed(2);
    const lineTotal = (it.qty * it.unit_price).toFixed(2);
    const vals = [
      it.partNumber,
      it.description,
      it.qty,
      `$${unitPrice}`,
      `$${lineTotal}`
    ];

    // Draw row border
    doc.rect(40, y, tableWidth, rowHeight).stroke('#ddd');

    // Draw each cell
    vals.forEach((txt, i) => {
      doc.text(txt, 40 + i * colWidth + 5, y + 5, {
        width: colWidth - 10
      });
    });

    y += rowHeight;
  });

  // Move doc.y to end of table
  doc.y = y;

  // Total Price
  const totalPrice = items.reduce((sum, it) => sum + it.qty * it.unit_price, 0).toFixed(2);
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Total Price', 40, doc.y + 10)
    .text(`$${totalPrice}`, 40 + 3 * colWidth, doc.y + 10, { align: 'right' });
  doc.y += rowHeight;
}
