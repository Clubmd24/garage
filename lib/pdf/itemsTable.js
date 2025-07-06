const cols = ['Part Number','Description','Qty','Unit Cost','Markup %','Unit Price','Line Total'];
export function addItemsTable(doc, { items }) {
  let y = doc.y;
  // Header
  doc
    .rect(40, y, 515, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .fontSize(10);
  cols.forEach((h, i) => {
    const x = 40 + i * 70;
    doc.text(h, x + 5, y + 5);
  });

  // Rows
  doc.fillColor('#000').fontSize(10);
  items.forEach((it, idx) => {
    const rowY = y + 20 + idx * 20;
    doc
      .rect(40, rowY, 515, 20)
      .stroke('#ddd');
    const vals = [
      it.partNumber,
      it.description,
      it.qty,
      it.unit_cost.toFixed(2),
      (it.markup_percent ?? 0).toFixed(2),
      it.unit_price.toFixed(2),
      (it.qty * it.unit_price).toFixed(2),
    ];
    vals.forEach((v, i) => {
      const x = 40 + i * 70;
      doc.text(v, x + 5, rowY + 5);
    });
  });

  const totalY = y + 20 + items.length * 20 + 10;
  const totalPrice = items.reduce((s, it) => s + it.qty * it.unit_price, 0).toFixed(2);
  const totalCost = items.reduce((s, it) => s + it.qty * it.unit_cost, 0).toFixed(2);
  const profit = (totalPrice - totalCost).toFixed(2);
  const markup = totalCost != 0 ? (((totalPrice - totalCost) / totalCost) * 100).toFixed(2) : '0.00';
  doc
    .font('Helvetica')
    .fontSize(12)
    .text('Total Price', 40, totalY)
    .text(`$${totalPrice}`, 485, totalY, { align: 'right' })
    .text('Total Cost', 40, totalY + 15)
    .text(`$${totalCost}`, 485, totalY + 15, { align: 'right' })
    .text(`Markup ${markup}%`, 40, totalY + 30)
    .text(`Profit $${profit}`, 40, totalY + 45)
    .moveDown(4);
}
