import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('finance report endpoint returns data', async () => {
  const report = { invoice_count: 1 };
  const getMock = jest.fn().mockResolvedValue(report);
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getFinanceReport: getMock,
    getEngineerPerformanceReport: jest.fn(),
    getBusinessPerformanceReport: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/reporting/finance.js');
  const req = { method: 'GET', query: { start: 'a', end: 'b' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(report);
  expect(getMock).toHaveBeenCalledWith('a', 'b');
});

test('finance report endpoint rejects method', async () => {
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getFinanceReport: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/reporting/finance.js');
  const req = { method: 'POST', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

test('finance report endpoint handles errors', async () => {
  const err = new Error('fail');
  const getMock = jest.fn().mockRejectedValue(err);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getFinanceReport: getMock,
  }));
  const { default: handler } = await import('../pages/api/reporting/finance.js');
  const req = { method: 'GET', query: { start: 'a', end: 'b' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

// engineer performance

test('engineer performance endpoint returns data', async () => {
  const report = [{ username: 'a', hours: 1 }];
  const getMock = jest.fn().mockResolvedValue(report);
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getEngineerPerformanceReport: getMock,
    getFinanceReport: jest.fn(),
    getBusinessPerformanceReport: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/reporting/engineer-performance.js');
  const req = { method: 'GET', query: { start: 's', end: 'e' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(report);
  expect(getMock).toHaveBeenCalledWith('s', 'e');
});

test('engineer performance endpoint rejects method', async () => {
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getEngineerPerformanceReport: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/reporting/engineer-performance.js');
  const req = { method: 'POST', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

test('engineer performance endpoint handles errors', async () => {
  const err = new Error('boom');
  const getMock = jest.fn().mockRejectedValue(err);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getEngineerPerformanceReport: getMock,
  }));
  const { default: handler } = await import('../pages/api/reporting/engineer-performance.js');
  const req = { method: 'GET', query: { start: 's', end: 'e' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

// business performance

test('business performance endpoint returns data', async () => {
  const report = { jobs_created: 1 };
  const getMock = jest.fn().mockResolvedValue(report);
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getBusinessPerformanceReport: getMock,
    getFinanceReport: jest.fn(),
    getEngineerPerformanceReport: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/reporting/business-performance.js');
  const req = { method: 'GET', query: { start: 's', end: 'e' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(report);
  expect(getMock).toHaveBeenCalledWith('s', 'e');
});

test('business performance endpoint rejects method', async () => {
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getBusinessPerformanceReport: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/reporting/business-performance.js');
  const req = { method: 'POST', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

test('business performance endpoint handles errors', async () => {
  const err = new Error('bad');
  const getMock = jest.fn().mockRejectedValue(err);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/reportingService.js', () => ({
    getBusinessPerformanceReport: getMock,
  }));
  const { default: handler } = await import('../pages/api/reporting/business-performance.js');
  const req = { method: 'GET', query: { start: 's', end: 'e' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
