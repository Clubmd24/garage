import PDFDocument from 'pdfkit';
import path from 'path';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addVehicleTable } from './vehicleTable';
import { addItemsTable } from './itemsTable';
import { addTerms } from './terms';
import { addFooter } from './footer';

/**
 * Builds the quote PDF buffer with header, info boxes, vehicle, defect, items, terms, and footer.
 * Handles remote logos via HTTP fetch and falls back to default if unavailable.
 * @param {object} data - Full quote data including garage, client, vehicle, items, optional defect_description.
 * @returns {Promise<Buffer>} - PDF buffer.
 */
export async function buildQuotePdf(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Attempt to fetch remote logo if S3 or HTTP URL
  let logoBuffer;
  if (data.garage.logo && (data.garage.logo.startsWith('http://') || data.garage.logo.startsWith('https://'))) {
    try {
      const res = await fetch(data.garage.logo);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        logoBuffer = Buffer.from(arrayBuffer);
      } else {
        console.error('Failed to fetch logo URL:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error fetching logo:', err);
    }
  }

  // Draw footer on first page and on every new page
  addFooter(doc);
  doc.on('pageAdded', () => addFooter(doc));

  // Header with dynamic or default logo
  addHeader(doc, { ...data, logoBuffer });

  // Garage and client info
  addInfoBoxes(doc, data);

  // Vehicle details
  addVehicleTable(doc, data);

  // Reported defect section
  if (data.defect_description) {
    doc
      .moveDown(1)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Reported Defect:', { underline: true })
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(10)
      .text(data.defect_description)
      .moveDown(2);
  }

  // Items table
  addItemsTable(doc, data);

  // Terms and conditions
  addTerms(doc, data);

  // Finalize PDF generation
  doc.end();
  await new Promise(resolve => doc.on('end', resolve));
  return Buffer.concat(buffers);
}
