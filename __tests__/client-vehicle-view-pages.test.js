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

  await screen.findByText('Quote #2 - new');
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

  await screen.findByText('Quote #3 - sent');
});
