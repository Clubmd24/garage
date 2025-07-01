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
