import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('vehicle mileage GET returns rows', async () => {
  const rows = [{ id: 1 }];
  const listMock = jest.fn().mockResolvedValue(rows);
  jest.unstable_mockModule('../services/vehicleMileageService.js', () => ({
    getMileageForVehicle: listMock,
    addMileage: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/vehicle-mileage/index.js');
  const req = { method: 'GET', query: { vehicle_id: '2' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(listMock).toHaveBeenCalledWith('2');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(rows);
});

test('vehicle mileage POST creates entry', async () => {
  const entry = { id: 2 };
  const createMock = jest.fn().mockResolvedValue(entry);
  jest.unstable_mockModule('../services/vehicleMileageService.js', () => ({
    getMileageForVehicle: jest.fn(),
    addMileage: createMock,
  }));
  const { default: handler } = await import('../pages/api/vehicle-mileage/index.js');
  const req = { method: 'POST', body: { vehicle_id: 1, mileage: 100 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(createMock).toHaveBeenCalledWith(req.body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(entry);
});
