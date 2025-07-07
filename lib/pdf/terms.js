// lib/pdf/terms.js

/**
 * Renders the quotation terms centered at the bottom of the last page.
 * @param {PDFKit.PDFDocument} doc
 * @param {object} data
 * @param {string} data.terms - Terms text.
 */
export function addTerms(doc, { terms }) {
  const y = doc.page.height - 80;
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#000')
    .text('Quotation Terms and Statement', 0, y, {
      align: 'center',
      width: doc.page.width - 80
    })
    .moveDown(0.5)
    .font('Helvetica')
    .fontSize(8)
    .text(terms, {
      align: 'center',
      width: doc.page.width - 80
    });
}
