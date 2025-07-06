export function addInfoBoxes(doc, { garage, client }) {
  const boxWidth = 250;
  const startY = doc.y;

  // Garage box
  doc
    .roundedRect(40, startY, boxWidth, 80, 5)
    .stroke('#ddd');
  doc
    .font('Brand')
    .fontSize(10)
    .text(`${garage.name}\n${garage.address}\n${garage.phone}\n${garage.email}`, 50, startY + 10);

  // Client box
  const clientX = 40 + boxWidth + 20;
  doc
    .roundedRect(clientX, startY, boxWidth, 80, 5)
    .stroke('#ddd');
  doc
    .text(`${client.name}\n${client.phone}\n${client.email}`, clientX + 10, startY + 10)
    .moveDown(2);
}
