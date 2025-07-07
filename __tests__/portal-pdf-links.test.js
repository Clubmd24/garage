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

test('PortalDashboard shows PDF link for each quote', async () => {
  jest.unstable_mockModule('../lib/jobStatuses.js', () => ({
    fetchJobStatuses: jest.fn().mockResolvedValue([])
  }));
  const { PortalDashboard } = await import('../components/PortalDashboard.js');
  const quotes = [
    { id: 1, status: 'new' },
    { id: 2, status: 'sent' }
  ];
  render(
    <PortalDashboard
      title=""
      requestJobPath="/"
      vehicles={[]}
      jobs={[]}
      quotes={quotes}
      setQuotes={() => {}}
      invoices={[]}
    />
  );
  const links = await screen.findAllByRole('link', { name: 'View PDF' });
  expect(links).toHaveLength(quotes.length);
  expect(links[0]).toHaveAttribute('href', '/api/quotes/1/pdf');
});

test('local vehicle detail page shows PDF link', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '5' }, replace: jest.fn(), push: jest.fn() })
  }));
  jest.unstable_mockModule('../lib/jobs.js', () => ({
    fetchJobs: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../lib/logout.js', () => ({ default: jest.fn() }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) }) // local/me
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 5 }) }) // vehicle
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 10, vehicle_id: 5, status: 'new' }] }) // quotes
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // invoices
    .mockResolvedValueOnce({ ok: true, json: async () => [] }); // mileage

  const { default: Page } = await import('../pages/local/vehicles/[id].js');
  render(<Page />);

  const link = await screen.findByRole('link', { name: 'View PDF' });
  expect(link).toHaveAttribute('href', '/api/quotes/10/pdf');
});


test('fleet vehicle detail page shows PDF link', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '5' }, replace: jest.fn(), push: jest.fn() })
  }));
  jest.unstable_mockModule('../lib/jobs.js', () => ({
    fetchJobs: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../lib/logout.js', () => ({ default: jest.fn() }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) }) // fleet/me
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 5 }) }) // vehicle
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 11, vehicle_id: 5, status: 'sent' }] }) // quotes
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // invoices
    .mockResolvedValueOnce({ ok: true, json: async () => [] }); // mileage

  const { default: Page } = await import('../pages/fleet/vehicles/[id].js');
  render(<Page />);

  const link = await screen.findByRole('link', { name: 'View PDF' });
  expect(link).toHaveAttribute('href', '/api/quotes/11/pdf');
});
