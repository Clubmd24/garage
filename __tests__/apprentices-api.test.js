import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('GET /api/apprentices returns list', async () => {
  const data = [{ id: 1 }];
  const getMock = jest.fn().mockResolvedValue(data);
  jest.unstable_mockModule('../services/apprenticesService.js', () => ({
    getAllApprentices: getMock,
    createApprentice: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/apprentices/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(data);
});

test('POST /api/apprentices creates apprentice', async () => {
  const created = { id: 2 };
  const createMock = jest.fn().mockResolvedValue(created);
  jest.unstable_mockModule('../services/apprenticesService.js', () => ({
    getAllApprentices: jest.fn(),
    createApprentice: createMock,
  }));
  jest.unstable_mockModule('../lib/schemas.js', () => ({
    CreateApprenticeSchema: { parse: x => x },
  }));
  const { default: handler } = await import('../pages/api/apprentices/index.js');
  const req = { method: 'POST', body: { first_name: 'A' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(created);
  expect(createMock).toHaveBeenCalledWith(req.body);
});
