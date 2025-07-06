import path from 'path';
export function addHeader(doc, { quoteNumber }) {
  // Logo
  doc.image(path.join(process.cwd(), '/public/assets/logo.png'), 40, 30, { width: 80 });
  // Title + number
  doc
    .font('Brand')
    .fontSize(20)
    .text('INVOICE', 0, 40, { align: 'right' })
    .fontSize(12)
    .text(`Invoice # ${quoteNumber}`, { align: 'right' })
    .moveDown(2);
}
