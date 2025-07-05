/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('selecting a client keeps vehicles loaded', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: {}, push: jest.fn(), isReady: true }),
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // fleets
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, first_name: 'A', last_name: 'B' }] }) // client search
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, licence_plate: 'XYZ' }] }); // vehicles

  const { default: NewPage } = await import('../pages/office/quotations/new.js');
  render(<NewPage />);

  fireEvent.change(screen.getByPlaceholderText('Client name or email'), { target: { value: 'A' } });
  await screen.findByText('A B');
  fireEvent.click(screen.getByText('A B'));

  await screen.findByText('XYZ');
  expect(screen.getByText('XYZ')).toBeInTheDocument();
});
