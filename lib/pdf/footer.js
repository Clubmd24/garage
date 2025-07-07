// lib/pdf/footer.js

/**
 * Renders the footer text at the bottom center of each page
 * without ever spilling onto a new page.
 */
export function addFooter(doc) {
  const text = 'Powered by Garage Vision – www.garagevision.app';
  const width = doc.page.width - 80;
  const bottomY = doc.page.height - 40;

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#666')
    .text(text, 40, bottomY, {
      width,
      align: 'center',
      lineBreak: false,  // NEVER break into a new line/page
      height: 10         // constrain to a single line box
    });
}
