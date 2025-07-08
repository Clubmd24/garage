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

test('job view page displays data from api', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '1' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, customer_id: 2, vehicle_id: 3, status: 'in progress', notes: 'x', assignments: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, first_name: 'A', last_name: 'B' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 3, licence_plate: 'XYZ' }) });

  const { default: Page } = await import('../pages/office/jobs/[id].js');
  render(<Page />);

  await screen.findByText('Job #1');
  expect(screen.getByText('A B')).toBeInTheDocument();
  expect(screen.getByText('XYZ')).toBeInTheDocument();
  expect(screen.getByText('in progress')).toBeInTheDocument();
});
