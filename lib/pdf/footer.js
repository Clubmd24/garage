// lib/pdf/footer.js

/**
 * Renders the footer text at the bottom center of each page.
 * Disables lineBreak so it never spawns a new page.
 */
export function addFooter(doc) {
  const bottomY = doc.page.height - 40;
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#666')
    .text(
      'Powered by Garage Vision – www.garagevision.app',
      40,
      bottomY,
      {
        align: 'center',
        width: doc.page.width - 80,
        lineBreak: false    // Prevents auto-pagination
      }
    );
}
