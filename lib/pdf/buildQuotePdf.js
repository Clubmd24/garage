import PDFDocument from 'pdfkit';
import { addHeader } from './header';
import { addInfoBoxes } from './infoBoxes';
import { addVehicleTable } from './vehicleTable';
import { addItemsTable } from './itemsTable';
import { addTerms } from './terms';
import { addFooter } from './footer';

export async function buildQuotePdf(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  doc.registerFont('Brand', './public/fonts/YourBrand-Regular.ttf');

  addHeader(doc, data);
  addInfoBoxes(doc, data);
  addVehicleTable(doc, data);
  addItemsTable(doc, data);
  addTerms(doc, data);
  addFooter(doc);

  doc.end();
  await new Promise((r) => doc.on('end', r));
  return Buffer.concat(buffers);
}
