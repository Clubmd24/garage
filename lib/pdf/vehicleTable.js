/**
 * Draws a table of vehicle properties, dynamically handling all fields in `vehicle`.
 * @param {PDFKit.PDFDocument} doc - The PDF document instance.
 * @param {object} data
 * @param {object} data.vehicle - Vehicle info object with arbitrary keys.
 */
export function addVehicleTable(doc, { vehicle }) {
  // Prepare headers and values based on vehicle object keys
  const keys = Object.keys(vehicle);
  const headers = keys.map(key =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  );
  const values = Object.values(vehicle).map(v => (v != null ? String(v) : ''));

  const startY = doc.y + 20;
  const tableWidth = doc.page.width - 80;  // account for 40px margins
  const colCount = headers.length;
  const colWidth = tableWidth / colCount;

  // Header row background
  doc
    .rect(40, startY, tableWidth, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(10);

  // Draw headers
  headers.forEach((h, i) => {
    doc.text(h, 40 + i * colWidth + 5, startY + 5, {
      width: colWidth - 10
    });
  });

  // Data row border and values
  const dataY = startY + 20;
  doc
    .rect(40, dataY, tableWidth, 20)
    .stroke('#ddd')
    .fillColor('#000')
    .font('Helvetica')
    .fontSize(10);

  values.forEach((v, i) => {
    doc.text(v, 40 + i * colWidth + 5, dataY + 5, {
      width: colWidth - 10
    });
  });

  doc.moveDown(3);
}
