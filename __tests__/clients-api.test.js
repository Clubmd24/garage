import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET /clients success

test('clients index returns list of clients', async () => {
  const clients = [{ id: 1, first_name: 'Alice', last_name: 'A' }];
  const getAllMock = jest.fn().mockResolvedValue(clients);
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getAllClients: getAllMock,
    createClient: jest.fn(),
    searchClients: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(clients);
  expect(getAllMock).toHaveBeenCalledTimes(1);
});


test('clients index creates client', async () => {
  const newClient = { id: 2, first_name: 'Bob' };
  const createMock = jest.fn().mockResolvedValue(newClient);
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getAllClients: jest.fn(),
    createClient: createMock,
    searchClients: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/index.js');
  const req = {
    method: 'POST',
    body: { first_name: 'Bob' },
    headers: {},
  };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(newClient);
  expect(createMock).toHaveBeenCalledWith(req.body);
});


test('clients index rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getAllClients: jest.fn(),
    createClient: jest.fn(),
    searchClients: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/index.js');
  const req = { method: 'PUT', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
});


test('clients index handles errors', async () => {
  const error = new Error('db fail');
  const getAllMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getAllClients: getAllMock,
    createClient: jest.fn(),
    searchClients: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});


test('client detail returns client by id', async () => {
  const client = { id: 1, first_name: 'Alice' };
  const getMock = jest.fn().mockResolvedValue(client);
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: getMock,
    updateClient: jest.fn(),
    deleteClient: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/[id].js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(client);
  expect(getMock).toHaveBeenCalledWith('1');
});


test('client update returns updated data', async () => {
  const updated = { ok: true };
  const updateMock = jest.fn().mockResolvedValue(updated);
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: jest.fn(),
    updateClient: updateMock,
    deleteClient: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/[id].js');
  const req = {
    method: 'PUT',
    query: { id: '2' },
    body: { first_name: 'Bob' },
    headers: {},
  };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(updated);
  expect(updateMock).toHaveBeenCalledWith('2', req.body);
});


test('client delete succeeds', async () => {
  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: jest.fn(),
    updateClient: jest.fn(),
    deleteClient: deleteMock,
  }));
  const { default: handler } = await import('../pages/api/clients/[id].js');
  const req = { method: 'DELETE', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.end).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalledWith('3');
});


test('client detail rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: jest.fn(),
    updateClient: jest.fn(),
    deleteClient: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/[id].js');
  const req = { method: 'POST', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','PUT','DELETE']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});


test('client detail handles errors', async () => {
  const error = new Error('fail');
  const getMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: getMock,
    updateClient: jest.fn(),
    deleteClient: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/[id].js');
  const req = { method: 'GET', query: { id: '4' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

test('reset client password returns new password', async () => {
  const resetMock = jest.fn().mockResolvedValue('pwd');
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    resetClientPassword: resetMock,
  }));
  const { default: handler } = await import('../pages/api/clients/[id]/password.js');
  const req = { method: 'POST', query: { id: '7' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(resetMock).toHaveBeenCalledWith('7');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ password: 'pwd' });
});

test('reset client password rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    resetClientPassword: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/clients/[id]/password.js');
  const req = { method: 'GET', query: { id: '8' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
});

