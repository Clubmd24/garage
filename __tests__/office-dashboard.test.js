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

test('OfficeDashboard lists todays jobs', async () => {
  jest.unstable_mockModule('../lib/quotes', () => ({
    fetchQuotes: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([]),
    fetchJobsForDate: jest.fn().mockResolvedValue([
      { id: 1, licence_plate: 'XYZ', engineers: 'Alice', status: 'in progress' }
    ])
  }));
  jest.unstable_mockModule('../lib/invoices', () => ({
    fetchInvoices: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../lib/jobStatuses', () => ({
    fetchJobStatuses: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../lib/vehicles', () => ({
    fetchVehicles: jest.fn().mockResolvedValue([])
  }));

  const { default: OfficeDashboard } = await import('../components/OfficeDashboard.jsx');
  render(<OfficeDashboard />);

  const link = await screen.findByRole('link', { name: /XYZ/ });
  expect(link).toHaveAttribute('href', '/office/job-cards/1');
  expect(link.textContent).toContain('Alice');
  expect(link.textContent).toContain('in progress');
});

