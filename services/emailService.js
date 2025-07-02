import nodemailer from 'nodemailer';
import { getSmtpSettings } from './smtpSettingsService.js';
import { getQuoteById } from './quotesService.js';
import { getClientById } from './clientsService.js';
import { getQuoteItems } from './quoteItemsService.js';
import { getSettings } from './companySettingsService.js';
import { buildQuotePdf, buildInvoicePdf } from '../lib/pdf.js';
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
  const client = quote.customer_id ? await getClientById(quote.customer_id) : {};
  const items = await getQuoteItems(quoteId);
  const pdf = await buildQuotePdf({ company, quote, client, items });
  const recipient = to || client.email || client.email_1 || client.email_2;
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


