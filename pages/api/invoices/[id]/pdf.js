import { getSettings } from '../../../../services/companySettingsService.js';
import { getInvoiceById } from '../../../../services/invoicesService.js';
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
    
    const garage = {
      name: company?.company_name,
      logo: company?.logo_url,
      address: company?.address,
      phone: company?.phone,
      email: company?.email,
    };
    
    const clientInfo = invoice.client
      ? {
          name: `${invoice.client.first_name} ${invoice.client.last_name}`.trim(),
          phone: invoice.client.mobile || invoice.client.landline,
          email: invoice.client.email,
          address: invoice.client.street_address,
          city: invoice.client.town,
          postcode: invoice.client.post_code,
        }
      : {};
    
    const itemList = invoice.items?.map(it => ({
      partNumber: it.partNumber || '',
      description: it.description || '',
      qty: it.qty || 0,
      unit_price: it.unit_price || 0,
    })) || [];
    
    const vehicle = invoice.vehicle || {};
    const defect = invoice.defect_description || '';

    // Use invoice terms from company settings, fallback to invoice terms, then general terms
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
