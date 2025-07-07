/**
 * Draws a table of vehicle properties, dynamically handling all fields in `vehicle`.
 * @param {PDFKit.PDFDocument} doc
 * @param {object} data
 * @param {object} data.vehicle - Vehicle info object.
 */
export function addVehicleTable(doc, { vehicle }) {
  const keys = Object.keys(vehicle);
  const headers = keys.map(k =>
    k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );
  const values = Object.values(vehicle).map(v => (v != null ? String(v) : ''));

  // Start exactly at doc.y
  const startY = doc.y;
  const tableWidth = doc.page.width - 80;
  const rowHeight = 20;
  const colCount = headers.length;
  const colWidth = tableWidth / colCount;

  // Header row at startY
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

  // Data row immediately below
  const dataY = startY + rowHeight;
  doc
    .rect(40, dataY, tableWidth, rowHeight)
    .stroke('#ddd')
    .fillColor('#000')
    .font('Helvetica')
    .fontSize(10);

  values.forEach((v, i) => {
    doc.text(v, 40 + i * colWidth + 5, dataY + 5, {
      width: colWidth - 10
    });
  });

  // Move doc.y to end of table
  doc.y = dataY + rowHeight;
}
