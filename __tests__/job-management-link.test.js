/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('unassigned jobs page links to purchase orders', async () => {
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([{ id: 9 }]),
    fetchJob: jest.fn().mockResolvedValue({
      id: 9,
      vehicle: { licence_plate: 'XYZ' },
      quote: { defect_description: 'broken', items: [{ id: 1, description: 'part', qty: 1, partNumber: 'P1' }] }
    })
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([])
  }));

  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);

  const link = await screen.findByRole('link', { name: 'Purchase Orders' });
  expect(link).toHaveAttribute('href', '/office/jobs/9/purchase-orders');
  expect(screen.getByText('part')).toBeInTheDocument();
});

test('unassigned jobs page links to job view page', async () => {
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([{ id: 9 }]),
    fetchJob: jest.fn().mockResolvedValue({
      id: 9,
      vehicle: { licence_plate: 'XYZ' },
      quote: { defect_description: 'broken', items: [{ id: 1, description: 'part', qty: 1 }] }
    })
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([])
  }));

  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);

  const link = await screen.findByRole('link', { name: 'View Job' });
  expect(link).toHaveAttribute('href', '/office/jobs/9');
  expect(screen.getByText('XYZ')).toBeInTheDocument();
});
