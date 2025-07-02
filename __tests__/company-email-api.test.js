import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('smtp settings GET returns settings', async () => {
  const settings = { id: 1 };
  const getMock = jest.fn().mockResolvedValue(settings);
  jest.unstable_mockModule('../services/smtpSettingsService.js', () => ({
    getSmtpSettings: getMock,
    upsertSmtpSettings: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/company/smtp-settings.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(getMock).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(settings);
});

test('smtp settings PUT updates settings', async () => {
  const updated = { id: 1 };
  const upsertMock = jest.fn().mockResolvedValue(updated);
  jest.unstable_mockModule('../services/smtpSettingsService.js', () => ({
    getSmtpSettings: jest.fn(),
    upsertSmtpSettings: upsertMock,
  }));
  const { default: handler } = await import('../pages/api/company/smtp-settings.js');
  const req = { method: 'PUT', body: { host: 'smtp' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(upsertMock).toHaveBeenCalledWith(req.body);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(updated);
});
