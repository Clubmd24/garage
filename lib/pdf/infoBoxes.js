// lib/pdf/infoBoxes.js

/**
 * Draws company and customer info boxes with blue header bars.
 * Dynamically sizes the box height to fit the text.
 *
 * @param {PDFKit.PDFDocument} doc
 * @param {object} data
 * @param {object} data.garage - { name, address, phone, website }
 * @param {object} data.client - { name, address, city, postcode, phone, email }
 */
export function addInfoBoxes(doc, { garage, client }) {
  const boxWidth = 250;
  const lineHeight = 12;
  const padding = 5;
  const startY = doc.y;

  //
  // --- COMPANY BOX ---
  //

  // Prepare company lines
  const addrLines = garage.address
    ? garage.address.includes('\n')
      ? garage.address.split('\n')
      : garage.address.split(',').map(s => s.trim())
    : [];
  const compLines = [
    garage.name,
    ...addrLines.slice(0, 3),
    garage.phone,
    garage.website
  ].filter(Boolean);

  // Calculate body height
  const compBodyHeight = compLines.length * lineHeight + padding * 2;
  const compTotalHeight = 20 + compBodyHeight; // 20 for header

  // Header bar
  doc
    .rect(40, startY, boxWidth, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Company', 40 + padding, startY + 5);

  // Body border
  doc
    .fillColor('#000')
    .rect(40, startY + 20, boxWidth, compBodyHeight)
    .stroke('#ddd');

  // Render company text
  compLines.forEach((line, idx) => {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000')
      .text(
        line,
        40 + padding,
        startY + 20 + padding + idx * lineHeight,
        { width: boxWidth - padding * 2 }
      );
  });

  //
  // --- CUSTOMER BOX ---
  //

  const custX = 40 + boxWidth + 20;

  // Prepare customer lines
  const custAddrLines = client.address
    ? client.address.includes('\n')
      ? client.address.split('\n')
      : client.address.split(',').map(s => s.trim())
    : [];
  const custLines = [
    client.name,
    ...custAddrLines.slice(0, 2),
    `${client.city}, ${client.postcode}`,
    client.phone,
    client.email
  ].filter(Boolean);

  // Calculate body height
  const custBodyHeight = custLines.length * lineHeight + padding * 2;
  const custTotalHeight = 20 + custBodyHeight;

  // Header bar
  doc
    .rect(custX, startY, boxWidth, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Customer', custX + padding, startY + 5);

  // Body border
  doc
    .fillColor('#000')
    .rect(custX, startY + 20, boxWidth, custBodyHeight)
    .stroke('#ddd');

  // Render customer text
  custLines.forEach((line, idx) => {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000')
      .text(
        line,
        custX + padding,
        startY + 20 + padding + idx * lineHeight,
        { width: boxWidth - padding * 2 }
      );
  });

  // Move cursor below the taller of the two boxes
  const usedHeight = Math.max(compTotalHeight, custTotalHeight);
  doc.y = startY + usedHeight + 10;  // add a bit of spacing
  doc.fillColor('#000');
}
