import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET /invoices success

test('invoices index returns list of invoices', async () => {
  const invoices = [{ id: 1 }];
  const getAllMock = jest.fn().mockResolvedValue(invoices);
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getAllInvoices: getAllMock,
    createInvoice: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/invoices/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(invoices);
  expect(getAllMock).toHaveBeenCalledTimes(1);
});

test('invoices index creates invoice', async () => {
  const newInvoice = { id: 2 };
  const createMock = jest.fn().mockResolvedValue(newInvoice);
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getAllInvoices: jest.fn(),
    createInvoice: createMock,
  }));
  const { default: handler } = await import('../pages/api/invoices/index.js');
  const req = { method: 'POST', body: { amount: 5 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(newInvoice);
  expect(createMock).toHaveBeenCalledWith(req.body);
});

test('invoices index rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getAllInvoices: jest.fn(),
    createInvoice: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/invoices/index.js');
  const req = { method: 'PUT', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
});

test('invoices index handles errors', async () => {
  const error = new Error('db fail');
  const getAllMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getAllInvoices: getAllMock,
    createInvoice: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/invoices/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

test('invoice detail returns invoice by id', async () => {
  const invoice = { id: 1 };
  const getMock = jest.fn().mockResolvedValue(invoice);
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getInvoiceById: getMock,
    updateInvoice: jest.fn(),
    deleteInvoice: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/invoices/[id].js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(invoice);
  expect(getMock).toHaveBeenCalledWith('1');
});

test('invoice update returns updated data', async () => {
  const updated = { ok: true };
  const updateMock = jest.fn().mockResolvedValue(updated);
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getInvoiceById: jest.fn(),
    updateInvoice: updateMock,
    deleteInvoice: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/invoices/[id].js');
  const req = { method: 'PUT', query: { id: '2' }, body: { amount: 10 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(updated);
  expect(updateMock).toHaveBeenCalledWith('2', req.body);
});

test('invoice delete succeeds', async () => {
  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getInvoiceById: jest.fn(),
    updateInvoice: jest.fn(),
    deleteInvoice: deleteMock,
  }));
  const { default: handler } = await import('../pages/api/invoices/[id].js');
  const req = { method: 'DELETE', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.end).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalledWith('3');
});

test('invoice detail rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getInvoiceById: jest.fn(),
    updateInvoice: jest.fn(),
    deleteInvoice: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/invoices/[id].js');
  const req = { method: 'POST', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','PUT','DELETE']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

test('invoice detail handles errors', async () => {
  const error = new Error('fail');
  const getMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getInvoiceById: getMock,
    updateInvoice: jest.fn(),
    deleteInvoice: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/invoices/[id].js');
  const req = { method: 'GET', query: { id: '4' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
