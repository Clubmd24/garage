/**
 * Draws the items table for the quote PDF,
 * showing only customer-facing columns.
 * @param {PDFKit.PDFDocument} doc - The PDF document instance.
 * @param {object} data
 * @param {Array} data.items - Array of quote items
 */
export function addItemsTable(doc, { items }) {
  // Define headers: only customer-facing columns
  const headers = [
    'Part Number',
    'Description',
    'Qty',
    'Unit Price',
    'Line Total'
  ];

  const startY = doc.y;
  const tableWidth = doc.page.width - 80; // Account for 40px margins
  const colCount = headers.length;
  const colWidth = tableWidth / colCount;

  // Draw header row background
  doc
    .rect(40, startY, tableWidth, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(10);

  // Render header text
  headers.forEach((h, i) => {
    doc.text(h, 40 + i * colWidth + 5, startY + 5, {
      width: colWidth - 10
    });
  });

  // Draw rows
  let y = startY + 20;
  doc.fillColor('#000').font('Helvetica').fontSize(10);

  items.forEach((it, idx) => {
    // Calculate values
    const unitPrice = it.unit_price.toFixed(2);
    const lineTotal = (it.qty * it.unit_price).toFixed(2);
    const rowValues = [
      it.partNumber,
      it.description,
      it.qty,
      `$${unitPrice}`,
      `$${lineTotal}`
    ];

    // Draw row border
    doc.rect(40, y, tableWidth, 20).stroke('#ddd');

    // Render each cell, wrapping description if needed
    rowValues.forEach((txt, i) => {
      doc.text(txt, 40 + i * colWidth + 5, y + 5, {
        width: colWidth - 10
      });
    });

    y += 20;

    // Add new page if close to bottom
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = doc.y;
    }
  });

  // Draw Total Price line only
  const totalPrice = items
    .reduce((sum, it) => sum + it.qty * it.unit_price, 0)
    .toFixed(2);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Total Price', 40, y + 10)
    .text(`$${totalPrice}`, 40 + 3 * colWidth, y + 10, { align: 'right' })
    .moveDown(4);
}
