import PDFDocument from 'pdfkit';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addVehicleTable } from './vehicleTable';
import { addItemsTable } from './itemsTable';
import { addTerms } from './terms';
import { addFooter } from './footer';

/**
 * Builds the quote PDF buffer with header, info boxes, vehicle, defect, items, terms, and footer.
 * Ensures footer prints on every page.
 * @param {object} data - Full quote data including garage, client, vehicle, items, and optional defect_description.
 * @returns {Promise<Buffer>} - PDF buffer.
 */
export async function buildQuotePdf(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Draw footer on every new page
  doc.on('pageAdded', () => addFooter(doc));

  // Header
  addHeader(doc, data);

  // Garage and client info
  addInfoBoxes(doc, data);

  // Vehicle details
  addVehicleTable(doc, data);

  // Reported defect section if provided
  const defect = data.defect_description || data.defectDescription;
  if (defect) {
    doc
      .moveDown(1)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Reported Defect:', { underline: true })
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(10)
      .text(defect)
      .moveDown(2);
  }

  // Items table
  addItemsTable(doc, data);

  // Terms and conditions
  addTerms(doc, data);

  // Draw footer on the last page
  addFooter(doc);

  // Finalize and return buffer
  doc.end();
  await new Promise(resolve => doc.on('end', resolve));
  return Buffer.concat(buffers);
}
