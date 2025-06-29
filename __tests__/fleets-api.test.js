import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('fleets index returns list of fleets', async () => {
  const fleets = [{ id: 1 }];
  const getAllMock = jest.fn().mockResolvedValue(fleets);
  jest.unstable_mockModule('../services/fleetsService.js', () => ({
    getAllFleets: getAllMock,
    getFleetById: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/fleets/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(fleets);
  expect(getAllMock).toHaveBeenCalledTimes(1);
});

test('fleets index rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/fleetsService.js', () => ({
    getAllFleets: jest.fn(),
    getFleetById: jest.fn(),
    createFleet: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/fleets/index.js');
  const req = { method: 'PUT', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
});

test('fleets index handles errors', async () => {
  const error = new Error('fail');
  const getAllMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/fleetsService.js', () => ({
    getAllFleets: getAllMock,
    getFleetById: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/fleets/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

test('fleet detail returns fleet by id', async () => {
  const fleet = { id: 1 };
  const getMock = jest.fn().mockResolvedValue(fleet);
  jest.unstable_mockModule('../services/fleetsService.js', () => ({
    getFleetById: getMock,
    getAllFleets: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/fleets/[id].js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(fleet);
  expect(getMock).toHaveBeenCalledWith('1');
});

test('fleet detail rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/fleetsService.js', () => ({
    getFleetById: jest.fn(),
    getAllFleets: jest.fn(),
    updateFleet: jest.fn(),
    deleteFleet: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/fleets/[id].js');
  const req = { method: 'PATCH', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','PUT','DELETE']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PATCH Not Allowed');
});

test('fleet detail handles errors', async () => {
  const error = new Error('oops');
  const getMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/fleetsService.js', () => ({
    getFleetById: getMock,
    getAllFleets: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/fleets/[id].js');
  const req = { method: 'GET', query: { id: '2' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
