const cols = ['Part Number','Description','Qty','Unit Cost','Line Total'];
export function addItemsTable(doc, { items }) {
  let y = doc.y;
  // Header
  doc
    .rect(40, y, 515, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .fontSize(10);
  cols.forEach((h, i) => {
    const x = 40 + (i * 100);
    doc.text(h, x + 5, y + 5);
  });

  // Rows
  doc.fillColor('#000').fontSize(10);
  items.forEach((it, idx) => {
    const rowY = y + 20 + idx * 20;
    doc
      .rect(40, rowY, 515, 20)
      .stroke('#ddd');
    const vals = [it.partNumber, it.description, it.qty, it.unitCost.toFixed(2), (it.qty * it.unitCost).toFixed(2)];
    vals.forEach((v, i) => {
      const x = 40 + (i * 100);
      doc.text(v, x + 5, rowY + 5);
    });
  });

  // Totals line
  const totalY = y + 20 + items.length * 20 + 10;
  const total = items.reduce((sum, it) => sum + it.qty * it.unitCost, 0).toFixed(2);
  doc
    .font('Brand')
    .fontSize(12)
    .text('Total', 440, totalY, { width: 100, align: 'right' })
    .text(`$${total}`, 540, totalY, { align: 'right' })
    .moveDown(2);
}
