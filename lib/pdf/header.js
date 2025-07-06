import path from 'path';
export function addHeader(doc, { quoteNumber }) {
  // Logo
  doc.image(path.join(process.cwd(), 'public', 'logo.png'), 40, 30, { width: 80 });
  // Title + number
  doc
    // Helvetica is a built-in font provided by PDFKit
    .font('Helvetica')
    .fontSize(20)
    .text('INVOICE', 0, 40, { align: 'right' })
    .fontSize(12)
    .text(`Invoice # ${quoteNumber}`, { align: 'right' })
    .moveDown(2);
}
