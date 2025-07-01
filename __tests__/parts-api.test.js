import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('parts index creates part', async () => {
  const part = { id: 1 };
  const createMock = jest.fn().mockResolvedValue(part);
  jest.unstable_mockModule('../services/partsService.js', () => ({
    searchParts: jest.fn(),
    createPart: createMock,
  }));
  const { default: handler } = await import('../pages/api/parts/index.js');
  const req = { method: 'POST', body: { part_number: 'P1', supplier_id: 2 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(part);
  expect(createMock).toHaveBeenCalledWith({
    part_number: 'P1',
    description: undefined,
    unit_cost: undefined,
    supplier_id: 2,
  });
});

test('parts detail returns part', async () => {
  const part = { id: 1 };
  const getMock = jest.fn().mockResolvedValue(part);
  jest.unstable_mockModule('../services/partsService.js', () => ({
    getPartById: getMock,
    updatePart: jest.fn(),
    deletePart: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/parts/[id].js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(part);
  expect(getMock).toHaveBeenCalledWith('1');
});

test('parts detail updates part', async () => {
  const updateMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/partsService.js', () => ({
    getPartById: jest.fn(),
    updatePart: updateMock,
    deletePart: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/parts/[id].js');
  const req = { method: 'PUT', query: { id: '2' }, body: { part_number: 'X' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
  expect(updateMock).toHaveBeenCalledWith('2', req.body);
});

test('parts detail deletes part', async () => {
  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/partsService.js', () => ({
    getPartById: jest.fn(),
    updatePart: jest.fn(),
    deletePart: deleteMock,
  }));
  const { default: handler } = await import('../pages/api/parts/[id].js');
  const req = { method: 'DELETE', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.end).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalledWith('3');
});
