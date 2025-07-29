import { getSettings } from '../../../../services/companySettingsService.js';
import { getInvoiceById } from '../../../../services/invoicesService.js';
import { getClientById } from '../../../../services/clientsService.js';
import { getInvoiceItems } from '../../../../services/invoiceItemsService.js';
import * as jobService from '../../../../services/jobsService.js';
import { getVehicleById } from '../../../../services/vehiclesService.js';
import { getQuoteById } from '../../../../services/quotesService.js';
import { buildInvoicePdf } from '../../../../lib/pdf/buildInvoicePdf.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const invoice = await getInvoiceById(id);
    if (!invoice) return res.status(404).json({ error: 'Not Found' });
    
    const company = await getSettings();
    const client = invoice.customer_id ? await getClientById(invoice.customer_id) : null;
    const items = await getInvoiceItems(id);
    
    const garage = {
      name: company?.company_name,
      logo: company?.logo_url,
      address: company?.address,
      phone: company?.phone,
      email: company?.email,
    };
    
    const clientInfo = client
      ? {
          name: `${client.first_name} ${client.last_name}`.trim(),
          phone: client.mobile || client.landline,
          email: client.email,
          address: client.street_address,
          city: client.town,
          postcode: client.post_code,
        }
      : {};
    
    const itemList = items.map(it => ({
      partNumber: it.partNumber || '',
      description: it.description || '',
      qty: it.qty || 0,
      unit_price: it.unit_price || 0,
    }));
    
    // Get job and vehicle data
    let vehicle = {};
    let defect = '';
    
    if (invoice.job_id) {
      try {
        const job = await jobService.getJobById(invoice.job_id);
        if (job) {
          // Get vehicle data
          if (job.vehicle_id) {
            vehicle = await getVehicleById(job.vehicle_id) || {};
          }
          
          // Get defect description from quote
          if (job.quote_id) {
            const quote = await getQuoteById(job.quote_id);
            defect = quote?.defect_description || '';
          }
        }
      } catch (error) {
        console.error('Error retrieving job/vehicle data:', error);
      }
    }

    const baseTerms = invoice.terms || company.invoice_terms || company.terms || '';
    const bankDetails = [
      company.bank_name,
      company.bank_sort_code && `Sort code: ${company.bank_sort_code}`,
      company.bank_account_number && `Account: ${company.bank_account_number}`,
      company.bank_iban && `IBAN: ${company.bank_iban}`,
    ]
      .filter(Boolean)
      .join('\n');
    
    const pdf = await buildInvoicePdf({
      invoiceNumber: invoice.id,
      garage,
      client: clientInfo,
      items: itemList,
      vehicle,
      defect_description: defect,
      terms: bankDetails ? `${baseTerms}\n\n${bankDetails}` : baseTerms,
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    res.send(pdf);
  } catch (err) {
    console.error('Invoice PDF generation error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
