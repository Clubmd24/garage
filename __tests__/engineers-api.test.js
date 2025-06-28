import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET /engineers success

test('engineers index returns list of engineers', async () => {
  const engineers = [{ id: 1, username: 'Bob' }];
  const getAllMock = jest.fn().mockResolvedValue(engineers);
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getAllEngineers: getAllMock,
    createEngineer: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/engineers/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(engineers);
  expect(getAllMock).toHaveBeenCalledTimes(1);
});

test('engineers index creates engineer', async () => {
  const newEngineer = { id: 2, username: 'Sam' };
  const createMock = jest.fn().mockResolvedValue(newEngineer);
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getAllEngineers: jest.fn(),
    createEngineer: createMock,
  }));
  const { default: handler } = await import('../pages/api/engineers/index.js');
  const req = { method: 'POST', body: { username: 'Sam' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(newEngineer);
  expect(createMock).toHaveBeenCalledWith(req.body);
});

test('engineers index rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getAllEngineers: jest.fn(),
    createEngineer: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/engineers/index.js');
  const req = { method: 'PUT', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
});

test('engineers index handles errors', async () => {
  const error = new Error('db fail');
  const getAllMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getAllEngineers: getAllMock,
    createEngineer: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/engineers/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

test('engineer detail returns engineer by id', async () => {
  const engineer = { id: 1, username: 'Eve' };
  const getMock = jest.fn().mockResolvedValue(engineer);
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getEngineerById: getMock,
    updateEngineer: jest.fn(),
    deleteEngineer: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/engineers/[id].js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(engineer);
  expect(getMock).toHaveBeenCalledWith('1');
});

test('engineer update returns updated data', async () => {
  const updated = { ok: true };
  const updateMock = jest.fn().mockResolvedValue(updated);
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getEngineerById: jest.fn(),
    updateEngineer: updateMock,
    deleteEngineer: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/engineers/[id].js');
  const req = { method: 'PUT', query: { id: '2' }, body: { username: 'Jim' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(updated);
  expect(updateMock).toHaveBeenCalledWith('2', req.body);
});

test('engineer delete succeeds', async () => {
  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getEngineerById: jest.fn(),
    updateEngineer: jest.fn(),
    deleteEngineer: deleteMock,
  }));
  const { default: handler } = await import('../pages/api/engineers/[id].js');
  const req = { method: 'DELETE', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.end).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalledWith('3');
});

test('engineer detail rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getEngineerById: jest.fn(),
    updateEngineer: jest.fn(),
    deleteEngineer: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/engineers/[id].js');
  const req = { method: 'POST', query: { id: '1' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET','PUT','DELETE']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

test('engineer detail handles errors', async () => {
  const error = new Error('fail');
  const getMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/engineersService.js', () => ({
    getEngineerById: getMock,
    updateEngineer: jest.fn(),
    deleteEngineer: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/engineers/[id].js');
  const req = { method: 'GET', query: { id: '4' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
