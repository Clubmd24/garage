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

test('client and vehicle query params populate new quote form', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { client_id: '1', vehicle_id: '2' }, push: jest.fn(), isReady: true }),
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // fleets
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, first_name: 'A', last_name: 'B' }) }) // client
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, licence_plate: 'XYZ', customer_id: 1 }) }) // vehicle
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, first_name: 'A', last_name: 'B' }) }) // client again
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, licence_plate: 'XYZ' }] }); // vehicles

  const { default: NewPage } = await import('../pages/office/quotations/new.js');
  render(<NewPage />);

  await screen.findByDisplayValue('A B');
  expect(screen.getByDisplayValue('A B')).toBeInTheDocument();
  expect(screen.getByDisplayValue('XYZ')).toBeInTheDocument();
});
