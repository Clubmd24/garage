/**
 * Draws the garage and client info boxes with multi-line addresses.
 * @param {PDFKit.PDFDocument} doc - The PDF document instance.
 * @param {object} data
 * @param {object} data.garage - Garage info (name, address, phone, email).
 * @param {object} data.client - Client info (name, address, city, postcode, phone, email).
 */
export function addInfoBoxes(doc, { garage, client }) {
  const boxWidth = 250;
  const lineHeight = 12;
  const startY = doc.y;

  // Garage box
  doc.roundedRect(40, startY, boxWidth, 100, 5).stroke('#ddd');
  // Split garage address into up to 3 lines
  const addrLines = garage.address && garage.address.includes('\n')
    ? garage.address.split('\n')
    : garage.address
      ? garage.address.split(',').map(s => s.trim())
      : [];
  const garageLines = [
    garage.name,
    ...addrLines.slice(0, 3),
    garage.phone,
    garage.email
  ].filter(Boolean);
  garageLines.forEach((line, idx) => {
    doc.font('Helvetica').fontSize(10)
       .text(line, 50, startY + 10 + idx * lineHeight);
  });

  // Client box
  const clientX = 40 + boxWidth + 20;
  doc.roundedRect(clientX, startY, boxWidth, 100, 5).stroke('#ddd');
  // Split client address into lines
  const clientAddrLines = [];
  if (client.address) {
    if (client.address.includes('\n')) {
      clientAddrLines.push(...client.address.split('\n'));
    } else {
      clientAddrLines.push(...client.address.split(',').map(s => s.trim()));
    }
  }
  const clientLines = [
    client.name,
    ...clientAddrLines.slice(0, 2),
    client.city ? `${client.city}, ${client.postcode}` : null,
    client.phone,
    client.email
  ].filter(Boolean);
  clientLines.forEach((line, idx) => {
    doc.font('Helvetica').fontSize(10)
       .text(line, clientX + 10, startY + 10 + idx * lineHeight);
  });

  doc.moveDown(6);
}
