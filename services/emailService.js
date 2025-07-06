import nodemailer from 'nodemailer';
import { getSmtpSettings } from './smtpSettingsService.js';
import { getQuoteById } from './quotesService.js';
import { getClientById } from './clientsService.js';
import { getQuoteItems } from './quoteItemsService.js';
import { getSettings } from './companySettingsService.js';
import { buildInvoicePdf } from '../lib/pdf.js';
import { buildQuotePdf } from '../lib/pdf/buildQuotePdf.js';
import { getInvoiceById } from './invoicesService.js';
import { getInvoiceItems } from './invoiceItemsService.js';

function createTransport(opts) {
  return nodemailer.createTransport({
    host: opts.host,
    port: opts.port,
    secure: !!opts.secure,
    auth: opts.username ? { user: opts.username, pass: opts.password } : undefined,
  });
}

export async function sendQuoteEmail(quoteId, to) {
  const settings = await getSmtpSettings();
  if (!settings) throw new Error('SMTP settings not configured');
  const transporter = createTransport(settings);
  const quote = await getQuoteById(quoteId);
  const company = await getSettings();
  const garage = company;
  const clientInfo = quote.customer_id ? await getClientById(quote.customer_id) : {};
  const itemList = await getQuoteItems(quoteId);
  const pdf = await buildQuotePdf({
    quoteNumber: quote.id,
    garage,
    client: clientInfo,
    vehicle: {},
    items: itemList,
    terms: quote.terms || company.terms || ''
  });
  const recipient = to || clientInfo.email || clientInfo.email_1 || clientInfo.email_2;
  await transporter.sendMail({
    from: settings.from_email,
    to: recipient,
    subject: 'Quote',
    text: 'Please find attached your quote.',
    attachments: [{ filename: `quote-${quoteId}.pdf`, content: pdf }],
  });
}

export async function sendInvoiceEmail(invoiceId, to) {
  const settings = await getSmtpSettings();
  if (!settings) throw new Error('SMTP settings not configured');
  const transporter = createTransport(settings);
  const invoice = await getInvoiceById(invoiceId);
  const company = await getSettings();
  const client = invoice.customer_id ? await getClientById(invoice.customer_id) : {};
  const items = await getInvoiceItems(invoiceId);
  const pdf = await buildInvoicePdf({ company, invoice, client, items });
  const recipient = to || client.email || client.email_1 || client.email_2;
  await transporter.sendMail({
    from: settings.from_email,
    to: recipient,
    subject: 'Invoice',
    text: 'Please find attached your invoice.',
    attachments: [{ filename: `invoice-${invoiceId}.pdf`, content: pdf }],
  });
}


