import path from 'path';

/**
 * Adds the document header: dynamic logo, company name, title, and quote number.
 * Supports remote logos via data.logoBuffer.
 * Falls back to default logo.png for any URL-like garage.logo values.
 * @param {PDFKit.PDFDocument} doc - The PDF document instance.
 * @param {object} data
 * @param {object} data.garage - Garage info (logo filename or URL, name).
 * @param {Buffer} [data.logoBuffer] - Optional fetched logo buffer for remote URLs.
 * @param {string|number} data.quoteNumber - Quote number to display.
 * @param {string} [data.title='QUOTE'] - Title text.
 */
export function addHeader(doc, { garage, logoBuffer, quoteNumber, title = 'QUOTE' }) {
  // Determine logo input: prefer Buffer, then local file, else default
  let logoInput;

  if (logoBuffer) {
    // Use the fetched buffer for remote logos
    logoInput = logoBuffer;
  } else if (garage && garage.logo && !garage.logo.includes('://')) {
    // Treat as local filename under public/
    logoInput = path.join(process.cwd(), 'public', garage.logo);
  } else {
    // Fallback to default logo.png
    logoInput = path.join(process.cwd(), 'public', 'logo.png');
  }

  // Draw the logo
  doc.image(logoInput, 40, 30, { width: 80 });

  // Company name next to logo
  if (garage && garage.name) {
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(garage.name, 130, 45);
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
