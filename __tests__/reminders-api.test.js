import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('reminders GET lists reminders', async () => {
  const rows = [{ id: 1 }];
  jest.unstable_mockModule('../services/followUpRemindersService.js', () => ({
    listReminders: jest.fn().mockResolvedValue(rows),
    createReminder: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/reminders/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(rows);
});

test('reminders POST creates reminder', async () => {
  const created = { id: 2 };
  const createMock = jest.fn().mockResolvedValue(created);
  jest.unstable_mockModule('../services/followUpRemindersService.js', () => ({
    listReminders: jest.fn(),
    createReminder: createMock,
  }));
  const { default: handler } = await import('../pages/api/reminders/index.js');
  const req = { method: 'POST', body: { quote_id: 1 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(createMock).toHaveBeenCalledWith(req.body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(created);
});
