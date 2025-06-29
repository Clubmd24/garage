import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET /quotes success

test('quotes index returns list of quotes', async () => {
  const quotes = [{ id: 1 }];
  const getAllMock = jest.fn().mockResolvedValue(quotes);
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getAllQuotes: getAllMock,
    createQuote: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quotes/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(quotes);
  expect(getAllMock).toHaveBeenCalledTimes(1);
});

test('quotes index creates quote', async () => {
  const newQuote = { id: 2 };
  const createMock = jest.fn().mockResolvedValue(newQuote);
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getAllQuotes: jest.fn(),
    createQuote: createMock,
  }));
  const { default: handler } = await import('../pages/api/quotes/index.js');
  const req = { method: 'POST', body: { job_id: 1 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(newQuote);
  expect(createMock).toHaveBeenCalledWith(req.body);
});

test('quotes index rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getAllQuotes: jest.fn(),
    createQuote: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quotes/index.js');
  const req = { method: 'PUT', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
});

test('quotes index handles errors', async () => {
  const error = new Error('db fail');
  const getAllMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getAllQuotes: getAllMock,
    createQuote: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quotes/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

test('quote detail returns quote by id', async () => {
  const quote = { id: 1 };
  const getMock = jest.fn().mockResolvedValue(quote);
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getQuoteById: getMock,
    updateQuote: jest.fn(),
    deleteQuote: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quotes/[id].js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(quote);
  expect(getMock).toHaveBeenCalledWith('1');
});

test('quote update returns updated data', async () => {
  const updated = { ok: true };
  const updateMock = jest.fn().mockResolvedValue(updated);
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getQuoteById: jest.fn(),
    updateQuote: updateMock,
    deleteQuote: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quotes/[id].js');
  const req = { method: 'PUT', query: { id: '2' }, body: { total_amount: 5 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(updated);
  expect(updateMock).toHaveBeenCalledWith('2', req.body);
});

test('quote delete succeeds', async () => {
  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getQuoteById: jest.fn(),
    updateQuote: jest.fn(),
    deleteQuote: deleteMock,
  }));
  const { default: handler } = await import('../pages/api/quotes/[id].js');
  const req = { method: 'DELETE', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.end).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalledWith('3');
});

test('quote detail rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getQuoteById: jest.fn(),
    updateQuote: jest.fn(),
    deleteQuote: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quotes/[id].js');
  const req = { method: 'POST', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','PUT','DELETE']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

test('quote detail handles errors', async () => {
  const error = new Error('fail');
  const getMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/quotesService.js', () => ({
    getQuoteById: getMock,
    updateQuote: jest.fn(),
    deleteQuote: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/quotes/[id].js');
  const req = { method: 'GET', query: { id: '4' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
