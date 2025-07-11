import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('client login succeeds with valid credentials', async () => {
  const queryMock = jest.fn().mockResolvedValue([[{ id: 1, password_hash: 'hash', must_change_password: 1 }]]);
  const verifyMock = jest.fn().mockResolvedValue(true);
  const signMock = jest.fn().mockReturnValue('tok');
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    verifyPassword: verifyMock,
    signToken: signMock,
  }));
  const { default: handler } = await import('../pages/api/portal/local/login.js');
  const req = { method: 'POST', body: { garage_name: 'G1', vehicle_reg: 'REG', password: 'pw' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn() };
  await handler(req, res);
  expect(queryMock).toHaveBeenCalledWith(
    `SELECT c.id, c.password_hash, c.must_change_password
       FROM clients c
       JOIN vehicles v ON v.customer_id = c.id
      WHERE LOWER(c.garage_name)=LOWER(?) AND LOWER(v.licence_plate)=LOWER(?)
      LIMIT 1`,
    ['G1', 'REG']
  );
  expect(verifyMock).toHaveBeenCalledWith('pw', 'hash');
  expect(signMock).toHaveBeenCalledWith({ client_id: 1 });
  expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('local_token=tok'));
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true, must_change_password: true });
});

test('client login fails with wrong password', async () => {
  const queryMock = jest.fn().mockResolvedValue([[{ id: 2, password_hash: 'hash', must_change_password: 0 }]]);
  const verifyMock = jest.fn().mockResolvedValue(false);
  const signMock = jest.fn();
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    verifyPassword: verifyMock,
    signToken: signMock,
  }));
  const { default: handler } = await import('../pages/api/portal/local/login.js');
  const req = { method: 'POST', body: { garage_name: 'G1', vehicle_reg: 'REG', password: 'bad' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn() };
  await handler(req, res);
  expect(queryMock).toHaveBeenCalledWith(
    `SELECT c.id, c.password_hash, c.must_change_password
       FROM clients c
       JOIN vehicles v ON v.customer_id = c.id
      WHERE LOWER(c.garage_name)=LOWER(?) AND LOWER(v.licence_plate)=LOWER(?)
      LIMIT 1`,
    ['G1', 'REG']
  );
  expect(verifyMock).toHaveBeenCalledWith('bad', 'hash');
  expect(signMock).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
});

test('fleet login succeeds with valid credentials', async () => {
  const queryMock = jest.fn().mockResolvedValue([[{ id: 3, pin_hash: 'hash2' }]]);
  const verifyMock = jest.fn().mockResolvedValue(true);
  const signMock = jest.fn().mockReturnValue('ftok');
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    verifyPassword: verifyMock,
    signToken: signMock,
  }));
  const { default: handler } = await import('../pages/api/portal/fleet/login.js');
  const req = { method: 'POST', body: { garage_name: 'G2', company_name: 'FleetCo', pin: '1234' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn() };
  await handler(req, res);
  expect(queryMock).toHaveBeenCalledWith(
    'SELECT id, pin_hash FROM fleets WHERE LOWER(garage_name)=LOWER(?) AND LOWER(company_name)=LOWER(?)',
    ['G2', 'FleetCo']
  );
  expect(verifyMock).toHaveBeenCalledWith('1234', 'hash2');
  expect(signMock).toHaveBeenCalledWith({ fleet_id: 3 });
  expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('fleet_token=ftok'));
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});

test('fleet login fails with wrong pin', async () => {
  const queryMock = jest.fn().mockResolvedValue([[{ id: 4, pin_hash: 'hash2' }]]);
  const verifyMock = jest.fn().mockResolvedValue(false);
  const signMock = jest.fn();
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    verifyPassword: verifyMock,
    signToken: signMock,
  }));
  const { default: handler } = await import('../pages/api/portal/fleet/login.js');
  const req = { method: 'POST', body: { garage_name: 'G2', company_name: 'FleetCo', pin: '0000' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn() };
  await handler(req, res);
  expect(queryMock).toHaveBeenCalledWith(
    'SELECT id, pin_hash FROM fleets WHERE LOWER(garage_name)=LOWER(?) AND LOWER(company_name)=LOWER(?)',
    ['G2', 'FleetCo']
  );
  expect(verifyMock).toHaveBeenCalledWith('0000', 'hash2');
  expect(signMock).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
});
