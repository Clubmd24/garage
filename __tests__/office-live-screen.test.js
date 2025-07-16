/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});


test('LiveScreen lists todays jobs only', async () => {
  const today = new Date().toISOString().slice(0, 10);
  const jobs = [
    { id: 1, status: 'in progress', scheduled_start: '2024-01-01T10:00:00Z', scheduled_end: '2024-01-01T11:00:00Z' }
  ];
  const fetchJobsForDate = jest.fn().mockResolvedValue(jobs);

  jest.unstable_mockModule('../lib/quotes', () => ({
    fetchQuotes: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobsForDate
  }));
  jest.unstable_mockModule('../lib/invoices', () => ({
    fetchInvoices: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../lib/jobStatuses.js', () => ({
    fetchJobStatuses: jest.fn().mockResolvedValue([{ id: 1, name: 'in progress' }])
  }));

  const { default: Page } = await import('../pages/office/live-screen/index.js');
  render(<Page />);

  const link = await screen.findByRole('link', { name: 'Job #1 – in progress' });
  expect(link).toHaveAttribute('href', '/office/jobs/1');
  expect(fetchJobsForDate).toHaveBeenCalledWith(today);
});

