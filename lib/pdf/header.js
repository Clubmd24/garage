// lib/pdf/header.js

/**
 * Adds the document header: company name, title, and document number.
 * Company logo removed.
 */
export function addHeader(doc, { garage, quoteNumber, title = 'QUOTE', generatedDate }) {
  // Company name large
  doc
    .font('Helvetica-Bold')
    .fontSize(32)
    .text(garage.name, 40, 40);

  // Title and document number aligned right under header
  doc
    .font('Helvetica')
    .fontSize(20)
    .text(title, 0, 48, { align: 'right' })
    .fontSize(12)
    .text(`${title} #${quoteNumber}`, { align: 'right' });
  
  // Add generation date if provided
  if (generatedDate) {
    doc
      .fontSize(10)
      .text(`Generated: ${generatedDate}`, { align: 'right' });
  }
  
  doc.moveDown(2);
}
