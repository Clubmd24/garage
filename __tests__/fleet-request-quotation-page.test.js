/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('fleet request quote form submits and redirects', async () => {
  const push = jest.fn();
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ push, replace: jest.fn() })
  }));
  jest.unstable_mockModule('../lib/logout.js', () => ({ default: jest.fn() }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) }) // fleet/me
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, licence_plate: 'XYZ' }] }) // vehicles
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 3 }) }); // createQuote

  const { default: Page } = await import('../pages/fleet/request-quotation.js');
  render(<Page />);

  await screen.findByRole('option', { name: 'XYZ' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Request Quote' }));

  await waitFor(() => expect(push).toHaveBeenCalledWith('/fleet/quotes'));
  expect(global.fetch).toHaveBeenLastCalledWith(
    '/api/quotes',
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fleet_id: 1, vehicle_id: '2', status: 'new' })
    })
  );
});
