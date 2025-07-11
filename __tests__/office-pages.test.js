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

test('quotations listing shows client and vehicle info', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, customer_id: 1, vehicle_id: 2, total_amount: 10, status: 'new' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, first_name: 'A', last_name: 'B' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, licence_plate: 'XYZ', make: 'Ford' }] });
  const { default: QuotationsPage } = await import('../pages/office/quotations/index.js');
  render(<QuotationsPage />);
  await screen.findByText('Quote #1');
  expect(screen.getByText('A B')).toBeInTheDocument();
  expect(screen.getByText('XYZ')).toBeInTheDocument();
  expect(screen.getByText('Ford')).toBeInTheDocument();
});

test('job cards listing shows client and vehicle info', async () => {
  jest.unstable_mockModule('../components/useCurrentUser.js', () => ({
    useCurrentUser: () => ({ user: null })
  }));
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, customer_id: 1, vehicle_id: 2, total_amount: 20, status: 'job-card' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, first_name: 'A', last_name: 'B' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, licence_plate: 'XYZ', make: 'Ford' }] });
  const { default: JobCardsPage } = await import('../pages/office/job-cards/index.js');
  render(<JobCardsPage />);
  await screen.findByText('Job #1');
  expect(screen.getByText('A B')).toBeInTheDocument();
  expect(screen.getByText('XYZ')).toBeInTheDocument();
  expect(screen.getByText('Ford')).toBeInTheDocument();
});

test('job cards link to associated job', async () => {
  jest.unstable_mockModule('../components/useCurrentUser.js', () => ({
    useCurrentUser: () => ({ user: null })
  }));
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, job_id: 7, customer_id: 1, vehicle_id: 3, total_amount: 50, status: 'job-card' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, json: async () => [] });
  const { default: JobCardsPage } = await import('../pages/office/job-cards/index.js');
  render(<JobCardsPage />);
  const link = await screen.findByRole('link', { name: 'Job #7' });
  expect(link).toHaveAttribute('href', '/office/jobs/7');
});

test('invoices listing shows client and vehicle info', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, customer_id: 1, vehicle_id: 2, amount: 30, status: 'issued' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, first_name: 'A', last_name: 'B' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, licence_plate: 'XYZ', make: 'Ford' }] });
  const { default: InvoicesPage } = await import('../pages/office/invoices/index.js');
  render(<InvoicesPage />);
  await screen.findByText('Invoice #1');
  expect(screen.getByText('A B')).toBeInTheDocument();
  expect(screen.getByText('XYZ')).toBeInTheDocument();
  expect(screen.getByText('Ford')).toBeInTheDocument();
});

test('job management shows vehicle plate and defect', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, vehicle_id: 2 }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, vehicle: { licence_plate: 'XYZ' }, quote: { defect_description: 'broken' } })
    });
  const { default: JobManagementPage } = await import('../pages/office/job-management/index.js');
  render(<JobManagementPage />);
  await screen.findByText('Job #1');
  expect(screen.getByText('XYZ')).toBeInTheDocument();
  expect(screen.getByText('broken')).toBeInTheDocument();
});

