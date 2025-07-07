// File: lib/pdf/infoBoxes.js
import PDFDocument from 'pdfkit';
export function addInfoBoxes(doc, { garage, client }) {
  const boxWidth = 250;
  const startY = doc.y;
  const lineHeight = 12;

  // Garage box
  doc.roundedRect(40, startY, boxWidth, 100, 5).stroke('#ddd');
  const addrLines = garage.address
    ? (garage.address.includes('\n')
        ? garage.address.split('\n')
        : garage.address.split(',').map(s => s.trim()))
    : [];
  const garageLines = [
    garage.name,
    ...addrLines.slice(0, 3),
    garage.phone,
    garage.website                 // show website instead of email
  ].filter(Boolean);
  garageLines.forEach((line, idx) => {
    doc.font('Helvetica').fontSize(10)
       .text(line, 50, startY + 10 + idx * lineHeight);
  });

  // Client box
  const clientX = 40 + boxWidth + 20;
  doc.roundedRect(clientX, startY, boxWidth, 100, 5).stroke('#ddd');
  const clientAddr = client.address
    ? client.address.split('\n').length > 1
      ? client.address.split('\n')
      : client.address.split(',').map(s => s.trim())
    : [];
  const clientLines = [
    client.name,
    ...clientAddr.slice(0, 2),
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

