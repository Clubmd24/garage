import { NextApiRequest, NextApiResponse } from 'next';
import { buildQuotePdf } from '../../../../lib/pdf/buildQuotePdf';
import { getQuoteById } from '../../../../services/quotesService';
import { getSettings } from '../../../../services/companySettingsService';
import { getClientById } from '../../../../services/clientsService';
import { getVehicleById } from '../../../../services/vehiclesService';
import { getQuoteItems } from '../../../../services/quoteItemsService';

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Fetch base data
    const quote = await getQuoteById(id);
    const settings = await getSettings();
    const client = await getClientById(quote.customer_id);
    const vehicle = await getVehicleById(quote.vehicle_id);
    const items = await getQuoteItems(id);

    // Convert S3 path to public HTTPS URL
    let logoUrl = settings.logo_url;
    if (logoUrl && logoUrl.startsWith('s3://')) {
      const [, bucket, ...keyParts] = logoUrl.split('/');
      const Key = keyParts.join('/');
      logoUrl = `https://${bucket}.s3.amazonaws.com/${Key}`;
    }

    // Assemble payload for PDF builder
    const payload = {
      garage: {
        name:    settings.company_name,
        logo:    logoUrl || '',
        address: settings.address,
        phone:   settings.phone,
        website: settings.website
      },
      client: {
        name:     client.name,
        phone:    client.phone,
        email:    client.email,
        address:  client.address,
        city:     client.city,
        postcode: client.postcode
      },
      vehicle: {
        licence_plate: vehicle.licence_plate,
        make:          vehicle.make,
        model:         vehicle.model,
        color:         vehicle.color,
        vin_number:    vehicle.vin_number,
        id:            vehicle.id
      },
      items: items.map(it => ({
        partNumber:  it.partNumber,
        description: it.description,
        qty:         it.qty,
        unit_price:  it.unit_price
      })),
      defect_description: quote.defect_description || '',
      quoteNumber: quote.id,
      title: 'QUOTE'
    };

    // Build PDF and stream to client
    const pdfBuffer = await buildQuotePdf(payload);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="quote-${id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('QUOTE_PDF_ERROR:', err);
    res.status(500).json({ error: 'Failed to generate quote PDF' });
  }
}
