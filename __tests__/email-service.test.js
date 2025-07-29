import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('sendQuoteEmail sends mail', async () => {
  const sendMock = jest.fn().mockResolvedValue();
  jest.unstable_mockModule('nodemailer', () => ({
    default: { createTransport: () => ({ sendMail: sendMock }) },
    createTransport: () => ({ sendMail: sendMock }),
  }));
  process.env.DATABASE_URL = 'mysql://u:p@localhost/db';
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn().mockResolvedValue([[]]) },
  }));
  jest.unstable_mockModule('../services/smtpSettingsService.js', () => ({
    getSmtpSettings: () => ({ host: 'h', port: 1, from_email: 'f' }),
  }));
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getQuoteById: () => ({ id: 1 })
  }));
  jest.unstable_mockModule('../services/companySettingsService.js', () => ({
    getSettings: () => ({})
  }));
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: () => ({ email: 'c' })
  }));
  jest.unstable_mockModule('../services/quoteItemsService.js', () => ({
    getQuoteItems: () => []
  }));
  const buildMock = jest.fn().mockResolvedValue(Buffer.from('PDF'));
  jest.unstable_mockModule('../lib/pdf/buildQuotePdf.js', () => ({
    buildQuotePdf: buildMock
  }));
  jest.unstable_mockModule('../lib/pdf/buildInvoicePdf.js', () => ({
    buildInvoicePdf: jest.fn()
  }));
  const { sendQuoteEmail } = await import('../services/emailService.js');
  await sendQuoteEmail(1);
  expect(sendMock).toHaveBeenCalled();
  expect(buildMock).toHaveBeenCalled();
});

test('sendInvoiceEmail sends mail', async () => {
  const sendMock = jest.fn().mockResolvedValue();
  jest.unstable_mockModule('nodemailer', () => ({
    default: { createTransport: () => ({ sendMail: sendMock }) },
    createTransport: () => ({ sendMail: sendMock }),
  }));
  jest.unstable_mockModule('../services/smtpSettingsService.js', () => ({
    getSmtpSettings: () => ({ host: 'h', port: 1, from_email: 'f' }),
  }));
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getInvoiceById: () => ({ id: 1, customer_id: 2 })
  }));
  jest.unstable_mockModule('../services/companySettingsService.js', () => ({
    getSettings: () => ({})
  }));
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: () => ({ email: 'c' })
  }));
  jest.unstable_mockModule('../services/invoiceItemsService.js', () => ({
    getInvoiceItems: () => []
  }));
  const buildMock = jest.fn().mockResolvedValue(Buffer.from('PDF'));
  jest.unstable_mockModule('../lib/pdf/buildInvoicePdf.js', () => ({
    buildInvoicePdf: buildMock
  }));
  jest.unstable_mockModule('../lib/pdf/buildQuotePdf.js', () => ({
    buildQuotePdf: jest.fn()
  }));
  const { sendInvoiceEmail } = await import('../services/emailService.js');
  await sendInvoiceEmail(1);
  expect(sendMock).toHaveBeenCalled();
  expect(buildMock).toHaveBeenCalled();
});

