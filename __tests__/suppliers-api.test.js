import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('suppliers index returns list', async () => {
  const suppliers = [{ id: 1 }];
  const getAllMock = jest.fn().mockResolvedValue(suppliers);
  jest.unstable_mockModule('../services/suppliersService.js', () => ({
    getAllSuppliers: getAllMock,
    createSupplier: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/suppliers/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(suppliers);
});

test('suppliers index creates supplier', async () => {
  const supplier = { id: 2 };
  const createMock = jest.fn().mockResolvedValue(supplier);
  jest.unstable_mockModule('../services/suppliersService.js', () => ({
    getAllSuppliers: jest.fn(),
    createSupplier: createMock,
  }));
  const { default: handler } = await import('../pages/api/suppliers/index.js');
  const req = { method: 'POST', body: { name: 'A' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(supplier);
  expect(createMock).toHaveBeenCalledWith(req.body);
});

test('suppliers detail returns supplier', async () => {
  const supplier = { id: 1 };
  const getMock = jest.fn().mockResolvedValue(supplier);
  jest.unstable_mockModule('../services/suppliersService.js', () => ({
    getSupplierById: getMock,
    updateSupplier: jest.fn(),
    deleteSupplier: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/suppliers/[id].js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(supplier);
});

test('suppliers detail updates supplier', async () => {
  const updateMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/suppliersService.js', () => ({
    getSupplierById: jest.fn(),
    updateSupplier: updateMock,
    deleteSupplier: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/suppliers/[id].js');
  const req = { method: 'PUT', query: { id: '2' }, body: { name: 'B' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
  expect(updateMock).toHaveBeenCalledWith('2', req.body);
});

test('suppliers detail deletes supplier', async () => {
  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/suppliersService.js', () => ({
    getSupplierById: jest.fn(),
    updateSupplier: jest.fn(),
    deleteSupplier: deleteMock,
  }));
  const { default: handler } = await import('../pages/api/suppliers/[id].js');
  const req = { method: 'DELETE', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.end).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalledWith('3');
});
