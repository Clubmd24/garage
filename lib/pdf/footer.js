export function addFooter(doc) {
  const bottom = doc.page.height - 50;
  doc
    .strokeColor('#ddd')
    .moveTo(40, bottom)
    .lineTo(doc.page.width - 40, bottom)
    .stroke()
    .fontSize(8)
    .fillColor('#666')
    .text('Powered by Garage Vision – www.garagevision.app', 40, bottom + 10)
    .text('Pioneers of garage automation systems.', 40, bottom + 22);
}
