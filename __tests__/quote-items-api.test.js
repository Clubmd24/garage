import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('quote-items GET returns items', async () => {
  const rows = [{ id: 1 }];
  const getMock = jest.fn().mockResolvedValue(rows);
  jest.unstable_mockModule('../services/quoteItemsService.js', () => ({
    getQuoteItems: getMock,
    createQuoteItem: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quote-items/index.js');
  const req = { method: 'GET', query: { quote_id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(getMock).toHaveBeenCalledWith('1');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(rows);
});

test('quote-items POST creates item', async () => {
  const item = { id: 2 };
  const createMock = jest.fn().mockResolvedValue(item);
  jest.unstable_mockModule('../services/quoteItemsService.js', () => ({
    getQuoteItems: jest.fn(),
    createQuoteItem: createMock,
  }));
  const { default: handler } = await import('../pages/api/quote-items/index.js');
  const req = { method: 'POST', body: { quote_id: 1 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(createMock).toHaveBeenCalledWith(req.body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(item);
});
