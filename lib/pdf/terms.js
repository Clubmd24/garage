export function addTerms(doc, { terms }) {
  doc
    // Helvetica is a built-in font provided by PDFKit
    .font('Helvetica')
    .fontSize(10)
    .text('Quotation Terms and Statement', { underline: true })
    .moveDown(0.5)
    .fontSize(9)
    .text(terms, { align: 'left' })
    .moveDown(2);
}
