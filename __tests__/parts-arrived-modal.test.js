/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('schedule later calls parts arrived endpoint', async () => {
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([{ id: 1, status: 'awaiting parts' }]),
    fetchJob: jest.fn().mockResolvedValue({ id: 1, vehicle: {}, quote: {} }),
    markPartsArrived: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([]),
  }));
  const fetchSpy = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  global.fetch = fetchSpy;
  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);
  await screen.findByText('Job #1');
  fireEvent.click(screen.getByRole('button', { name: 'Parts Arrived' }));
  fireEvent.click(screen.getByRole('button', { name: 'Schedule later' }));
  await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  expect(fetchSpy.mock.calls[0][0]).toBe('/api/jobs/1/parts-arrived');
});

test('parts arrived button shows modal', async () => {
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([{ id: 3, status: 'awaiting parts' }]),
    fetchJob: jest.fn().mockResolvedValue({ id: 3, vehicle: {}, quote: {} }),
    markPartsArrived: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([]),
  }));
  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);
  await screen.findByText('Job #3');
  const btn = screen.getByRole('button', { name: 'Parts Arrived' });
  fireEvent.click(btn);
  expect(
    await screen.findByText('Parts have arrived for this job.')
  ).toBeInTheDocument();
});

test('schedule now assigns via assign endpoint', async () => {
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([{ id: 2, status: 'awaiting parts' }]),
    fetchJob: jest.fn().mockResolvedValue({ id: 2, vehicle: {}, quote: {} }),
    markPartsArrived: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([{ id: 7, username: 'E' }]),
  }));
  const fetchSpy = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  global.fetch = fetchSpy;
  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);
  await screen.findByText('Job #2');
  fireEvent.change(screen.getByLabelText('Engineer'), { target: { value: '7' } });
  fireEvent.change(screen.getByLabelText('Scheduled Start'), { target: { value: '2024-01-02T10:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Parts Arrived' }));
  fireEvent.click(screen.getByRole('button', { name: 'Schedule now' }));
  await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  expect(fetchSpy.mock.calls[0][0]).toBe('/api/jobs/2/assign');
});
