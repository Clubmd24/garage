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
    getQuoteItemById: jest.fn(),
    updateQuoteItem: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quote-items/index.js');
  const req = { method: 'POST', body: { quote_id: 1 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(createMock).toHaveBeenCalledWith(req.body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(item);
});

test('quote-item detail returns item', async () => {
  const item = { id: 3 };
  const getMock = jest.fn().mockResolvedValue(item);
  jest.unstable_mockModule('../services/quoteItemsService.js', () => ({
    getQuoteItemById: getMock,
    updateQuoteItem: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quote-items/[id].js');
  const req = { method: 'GET', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(getMock).toHaveBeenCalledWith('3');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(item);
});

test('quote-item detail updates item', async () => {
  const updateMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/quoteItemsService.js', () => ({
    getQuoteItemById: jest.fn(),
    updateQuoteItem: updateMock,
  }));
  const { default: handler } = await import('../pages/api/quote-items/[id].js');
  const req = { method: 'PUT', query: { id: '4' }, body: { qty: 2 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(updateMock).toHaveBeenCalledWith('4', req.body);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});
