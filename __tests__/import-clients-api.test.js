import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('creates new records when no matches', async () => {
  const createClient = jest.fn().mockResolvedValue({ id: 1 });
  const createVehicle = jest.fn().mockResolvedValue({ id: 2 });
  const createFleet = jest.fn().mockResolvedValue({ id: 3 });
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: jest.fn(),
    createClient,
    updateClient: jest.fn(),
    searchClients: jest.fn().mockResolvedValue([]),
  }));
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: jest.fn(),
    createVehicle,
    updateVehicle: jest.fn(),
    getAllVehicles: jest.fn().mockResolvedValue([]),
  }));
  jest.unstable_mockModule('../services/fleetsService.js', () => ({
    getFleetById: jest.fn(),
    createFleet,
    updateFleet: jest.fn(),
    getAllFleets: jest.fn().mockResolvedValue([]),
  }));
  const { default: handler } = await import('../pages/api/company/import-clients.js');
  const csv = 'email,licence_plate,company_name\n"john@example.com","ABC123","Acme"';
  const req = { method: 'POST', body: csv, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(createClient).toHaveBeenCalledTimes(1);
  expect(createVehicle).toHaveBeenCalledTimes(1);
  expect(createFleet).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});

test('updates existing records when matched', async () => {
  const updateClient = jest.fn();
  const updateVehicle = jest.fn();
  const updateFleet = jest.fn();
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: jest.fn(),
    createClient: jest.fn(),
    updateClient,
    searchClients: jest.fn().mockResolvedValue([{ id: 5, email: 'john@example.com' }]),
  }));
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: jest.fn(),
    createVehicle: jest.fn(),
    updateVehicle,
    getAllVehicles: jest.fn().mockResolvedValue([{ id: 7, licence_plate: 'XYZ' }]),
  }));
  jest.unstable_mockModule('../services/fleetsService.js', () => ({
    getFleetById: jest.fn(),
    createFleet: jest.fn(),
    updateFleet,
    getAllFleets: jest.fn().mockResolvedValue([{ id: 3, company_name: 'Acme' }]),
  }));
  const { default: handler } = await import('../pages/api/company/import-clients.js');
  const csv = 'email,licence_plate,company_name\n"john@example.com","XYZ","Acme"';
  const req = { method: 'POST', body: csv, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(updateClient).toHaveBeenCalledWith(5, expect.any(Object));
  expect(updateVehicle).toHaveBeenCalledWith(7, expect.any(Object));
  expect(updateFleet).toHaveBeenCalledWith(3, expect.any(Object));
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});
