const headers = ['License Plate','Make','Model','Color','VIN','Vehicle ID'];
export function addVehicleTable(doc, { vehicle }) {
  const startY = doc.y + 20;
  // Background for header row
  doc
    .rect(40, startY, 515, 20)
    .fill('#007bff')
    .fillColor('#fff')
    .fontSize(10);
  headers.forEach((h, i) => {
    const x = 40 + (i * 85);
    doc.text(h, x + 5, startY + 5);
  });

  // Data row
  doc
    .fillColor('#000')
    .rect(40, startY + 20, 515, 20)
    .stroke('#ddd');
  const values = [
    vehicle.licence_plate, vehicle.make, vehicle.model,
    vehicle.color, vehicle.vin_number, vehicle.id,
  ];
  values.forEach((v, i) => {
    const x = 40 + (i * 85);
    doc.text(v, x + 5, startY + 25);
  });

  doc.moveDown(3);
}
