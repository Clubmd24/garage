import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('quote pdf endpoint returns PDF', async () => {
  const quote = { id: 1, customer_id: 2, job_id: null, total_amount: 10 };
  const buildMock = jest.fn().mockResolvedValue(Buffer.from('PDF'));
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getQuoteById: jest.fn().mockResolvedValue(quote),
  }));
  jest.unstable_mockModule('../services/companySettingsService.js', () => ({
    getSettings: jest.fn().mockResolvedValue({})
  }));
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: jest.fn().mockResolvedValue({})
  }));
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: jest.fn().mockResolvedValue(null)
  }));
  jest.unstable_mockModule('../services/quoteItemsService.js', () => ({
    getQuoteItems: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../lib/pdf/buildQuotePdf.js', () => ({
    buildQuotePdf: buildMock
  }));
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn().mockResolvedValue([[]]) }
  }));
  const { default: handler } = await import('../pages/api/quotes/[id]/pdf.js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(buildMock).toHaveBeenCalled();
  expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
  expect(res.send).toHaveBeenCalledWith(Buffer.from('PDF'));
});
