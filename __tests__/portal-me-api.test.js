import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('client profile update calls updateClient with id from token', async () => {
  const updateMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: jest.fn(),
    updateClient: updateMock,
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    verifyToken: () => ({ client_id: 5 }),
  }));

  const { default: handler } = await import('../pages/api/portal/local/me.js');
  const req = {
    method: 'PUT',
    headers: { cookie: 'local_token=tok' },
    body: { first_name: 'Bob' },
  };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(updateMock).toHaveBeenCalledWith(5, req.body);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});
