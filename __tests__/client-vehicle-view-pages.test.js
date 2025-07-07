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

test('client view page lists quotes', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '1' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, first_name: 'A', last_name: 'B' }) }) // client
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // vehicles
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // documents
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, status: 'new' }] }); // quotes

  const { default: Page } = await import('../pages/office/clients/view/[id].js');
  render(<Page />);

  const quoteLink = await screen.findByRole('link', { name: 'Quote #2 - new' });
  expect(quoteLink).toHaveAttribute('href', '/office/quotations/2/edit');
});


test('vehicle view page lists quotes', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '5' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 5, customer_id: 1 }) }) // vehicle
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, first_name: 'A', last_name: 'B' }) }) // client
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // documents
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 3, status: 'sent' }] }); // quotes

  const { default: Page } = await import('../pages/office/vehicles/view/[id].js');
  render(<Page />);

  const vehicleQuoteLink = await screen.findByRole('link', { name: 'Quote #3 - sent' });
  expect(vehicleQuoteLink).toHaveAttribute('href', '/office/quotations/3/edit');
});

test('vehicle view page shows mileage history', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '6' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 6 }) }) // vehicle
    .mockResolvedValueOnce({ ok: true, json: async () => null }) // client
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // documents
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // quotes
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, mileage: 100, recorded_at: '2024-01-01' }] }); // mileage

  const { default: Page } = await import('../pages/office/vehicles/view/[id].js');
  render(<Page />);

  await screen.findByText('Mileage History');
  expect(screen.getByText('100')).toBeInTheDocument();
});
