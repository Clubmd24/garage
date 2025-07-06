import path from 'path';

/**
 * Adds the document header: dynamic logo, company name, title, and quote number.
 * @param {PDFKit.PDFDocument} doc - The PDF document instance.
 * @param {object} data
 * @param {object} data.garage - Garage info (logo filename, name).
 * @param {string|number} data.quoteNumber - Quote number to display.
 * @param {string} [data.title='QUOTE'] - Title text.
 */
export function addHeader(doc, { garage, quoteNumber, title = 'QUOTE' }) {
  // Determine logo path: use specific garage logo if provided, else fallback
  let logoPath = path.join(process.cwd(), 'public', 'logo.png');
  if (garage && garage.logo) {
    logoPath = path.join(process.cwd(), 'public', garage.logo);
  }

  // Draw logo
  doc.image(logoPath, 40, 30, { width: 80 });

  // Company name next to logo
  if (garage && garage.name) {
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(garage.name, 130, 45, { continued: false });
  }

  // Title and quote number, aligned to right
  doc
    .font('Helvetica')
    .fontSize(20)
    .text(title, 0, 40, { align: 'right' })
    .fontSize(12)
    .text(`Quote #${quoteNumber}`, { align: 'right' })
    .moveDown(2);
}
