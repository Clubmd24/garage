/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('unassigned jobs page links to purchase orders', async () => {
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([{ id: 9 }])
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([])
  }));

  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);

  const link = await screen.findByRole('link', { name: 'Purchase Orders' });
  expect(link).toHaveAttribute('href', '/office/jobs/9/purchase-orders');
});

test('unassigned jobs page links to job view page', async () => {
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([{ id: 9 }])
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([])
  }));

  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);

  const link = await screen.findByRole('link', { name: 'View Job' });
  expect(link).toHaveAttribute('href', '/office/jobs/9');
});
