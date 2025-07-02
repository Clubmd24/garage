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
  const { sendQuoteEmail } = await import('../services/emailService.js');
  await sendQuoteEmail(1);
  expect(sendMock).toHaveBeenCalled();
});

