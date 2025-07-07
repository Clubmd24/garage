import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET /vehicles success

test('vehicles index returns list of vehicles', async () => {
  const vehicles = [{ id: 1, licence_plate: 'ABC', service_date: '2024-01-01', itv_date: '2024-06-01' }];
  const getAllMock = jest.fn().mockResolvedValue(vehicles);
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getAllVehicles: getAllMock,
    createVehicle: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/vehicles/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(vehicles);
  expect(getAllMock).toHaveBeenCalledTimes(1);
});

test('vehicles index creates vehicle', async () => {
  const newVehicle = { id: 2, licence_plate: 'XYZ', service_date: '2024-01-01', itv_date: '2024-06-01' };
  const createMock = jest.fn().mockResolvedValue(newVehicle);
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getAllVehicles: jest.fn(),
    createVehicle: createMock,
  }));
  const { default: handler } = await import('../pages/api/vehicles/index.js');
  const req = { method: 'POST', body: { licence_plate: 'XYZ', service_date: '2024-01-01', itv_date: '2024-06-01' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(newVehicle);
  expect(createMock).toHaveBeenCalledWith(req.body);
});

test('vehicles index rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getAllVehicles: jest.fn(),
    createVehicle: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/vehicles/index.js');
  const req = { method: 'PUT', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
});

test('vehicles index handles errors', async () => {
  const error = new Error('db fail');
  const getAllMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getAllVehicles: getAllMock,
    createVehicle: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/vehicles/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

test('vehicle detail returns vehicle by id', async () => {
  const vehicle = { id: 1, licence_plate: 'AAA', service_date: '2024-01-01', itv_date: '2024-06-01' };
  const getMock = jest.fn().mockResolvedValue(vehicle);
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: getMock,
    updateVehicle: jest.fn(),
    deleteVehicle: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/vehicles/[id].js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(vehicle);
  expect(getMock).toHaveBeenCalledWith('1');
});

test('vehicle update returns updated data', async () => {
  const updated = { ok: true };
  const updateMock = jest.fn().mockResolvedValue(updated);
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: jest.fn(),
    updateVehicle: updateMock,
    deleteVehicle: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/vehicles/[id].js');
  const req = { method: 'PUT', query: { id: '2' }, body: { make: 'Ford' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(updated);
  expect(updateMock).toHaveBeenCalledWith('2', req.body);
});

test('vehicle delete succeeds', async () => {
  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: jest.fn(),
    updateVehicle: jest.fn(),
    deleteVehicle: deleteMock,
  }));
  const { default: handler } = await import('../pages/api/vehicles/[id].js');
  const req = { method: 'DELETE', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.end).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalledWith('3');
});

test('vehicle detail rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: jest.fn(),
    updateVehicle: jest.fn(),
    deleteVehicle: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/vehicles/[id].js');
  const req = { method: 'POST', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','PUT','DELETE']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

test('vehicle detail handles errors', async () => {
  const error = new Error('fail');
  const getMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: getMock,
    updateVehicle: jest.fn(),
    deleteVehicle: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/vehicles/[id].js');
  const req = { method: 'GET', query: { id: '4' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
