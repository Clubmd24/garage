import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('getFinanceReport runs query', async () => {
  const row = { invoice_count: 2 };
  const queryMock = jest.fn().mockResolvedValue([[row]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getFinanceReport } = await import('../services/reportingService.js');
  const result = await getFinanceReport('a', 'b');
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/FROM invoices/), ['a', 'b']);
  expect(result).toEqual(row);
});

test('getEngineerPerformanceReport runs query', async () => {
  const rows = [{ username: 'x', hours: 1 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getEngineerPerformanceReport } = await import('../services/reportingService.js');
  const result = await getEngineerPerformanceReport('s', 'e');
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/FROM time_entries/), ['s', 'e']);
  expect(result).toEqual(rows);
});

test('getBusinessPerformanceReport runs query', async () => {
  const row = { jobs_created: 1 };
  const queryMock = jest.fn().mockResolvedValue([[row]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getBusinessPerformanceReport } = await import('../services/reportingService.js');
  const result = await getBusinessPerformanceReport('s', 'e');
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/FROM jobs/), ['s', 'e']);
  expect(result).toEqual(row);
});
