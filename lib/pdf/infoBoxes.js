// lib/pdf/infoBoxes.js

/**
 * Draws company and customer info boxes with blue header bars.
 * @param {PDFKit.PDFDocument} doc
 * @param {object} data
 * @param {object} data.garage - { name, address, phone, website }
 * @param {object} data.client - { name, address, city, postcode, phone, email }
 */
export function addInfoBoxes(doc, { garage, client }) {
  const boxWidth = 250;
  const lineHeight = 12;
  const startY = doc.y;

  // Company box header
  doc
    .rect(40, startY, boxWidth, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Company', 45, startY + 5);

  // Company box body
  doc
    .fillColor('#000')
    .rect(40, startY + 20, boxWidth, 80)
    .stroke('#ddd');
  const compLines = [
    garage.name,
    ...garage.address.split('\n').slice(0, 3),
    garage.phone,
    garage.website
  ].filter(Boolean);
  compLines.forEach((line, idx) => {
    doc.text(line, 45, startY + 25 + idx * lineHeight, { width: boxWidth - 10 });
  });

  // Customer box header
  const custX = 40 + boxWidth + 20;
  doc
    .rect(custX, startY, boxWidth, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Customer', custX + 5, startY + 5);

  // Customer box body
  doc
    .fillColor('#000')
    .rect(custX, startY + 20, boxWidth, 80)
    .stroke('#ddd');
  const custLines = [
    client.name,
    ...client.address.split('\n').slice(0, 2),
    `${client.city}, ${client.postcode}`,
    client.phone,
    client.email
  ].filter(Boolean);
  custLines.forEach((line, idx) => {
    doc.text(line, custX + 5, startY + 25 + idx * lineHeight, { width: boxWidth - 10 });
  });

  // Advance past the boxes
  doc.moveDown(6).fillColor('#000');
}
