// File: pages/api/quotes/[id]/pdf.js
import { NextApiRequest, NextApiResponse } from 'next';
import { buildQuotePdf } from '../../../../lib/pdf/buildQuotePdf';
import { getSettings } from '../../../../services/companySettingsService';
import { getQuoteById } from '../../../../services/quotesService';
import { getClientById } from '../../../../services/clientsService';
import { getVehicleById } from '../../../../services/vehiclesService';
import { getQuoteItems } from '../../../../services/quoteItemsService';

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Fetch data
    const settings = await getSettings();
    if (!settings) throw new Error('No company settings found');
    const quote = await getQuoteById(id);
    if (!quote) throw new Error(`Quote ${id} not found`);
    const client = await getClientById(quote.customer_id);
    if (!client) throw new Error(`Client ${quote.customer_id} not found`);
    const vehicle = await getVehicleById(quote.vehicle_id);
    const items = await getQuoteItems(id);

    // Build payload
    const payload = {
      garage: {
        name: settings.company_name,
        logo: settings.logo_url,               // keep s3://... path
        address: settings.address,
        phone: settings.phone,
        website: settings.website,
        terms: settings.terms                  // pass company terms
      },
      client: {
        name: `${client.first_name} ${client.last_name}`,
        phone: client.mobile || client.landline,
        email: client.email,
        address: client.street_address,
        city: client.town,
        postcode: client.post_code
      },
      vehicle: {
        licence_plate: vehicle.licence_plate,
        make: vehicle.make,
        model: vehicle.model,
        color: vehicle.color,
        vin_number: vehicle.vin_number,
        id: vehicle.id
      },
      items: items.map(it => ({
        partNumber:  it.partNumber,
        description: it.description,
        qty:         it.qty,
        unit_price:  it.unit_price
      })),
      defect_description: quote.defect_description || '',
      quoteNumber: quote.id,
      title: 'QUOTE',
      terms: settings.terms                   // also for addTerms
    };

    // Generate PDF
    const pdfBuffer = await buildQuotePdf(payload);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="quote-${id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('QUOTE_PDF_ERROR:', err);
    res.status(500).json({ error: 'Failed to generate quote PDF' });
  }
}
