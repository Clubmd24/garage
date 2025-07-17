/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('job management page loads with status filter from query', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { status: 'awaiting parts' }, isReady: true })
  }));
  const fetchJobsMock = jest.fn().mockResolvedValue([{ id: 1, status: 'awaiting parts' }]);
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: fetchJobsMock,
    fetchJob: jest.fn().mockResolvedValue({ id: 1, vehicle: {}, quote: {} }),
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([]),
  }));
  jest.unstable_mockModule('../lib/jobStatuses', () => ({
    fetchJobStatuses: jest.fn().mockResolvedValue([{ id: 1, name: 'awaiting parts' }])
  }));

  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);

  await screen.findByText('Job #1');
  expect(fetchJobsMock).toHaveBeenCalledWith({ status: 'awaiting parts' });
  expect(screen.getByDisplayValue('awaiting parts')).toBeInTheDocument();
});

test('job management form submits with scheduled end', async () => {
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobs: jest.fn().mockResolvedValue([{ id: 9 }]),
    fetchJob: jest.fn().mockResolvedValue({
      id: 9,
      vehicle: { licence_plate: 'XYZ', make: 'Ford', model: 'Focus' },
      quote: {},
    }),
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([{ id: 2, username: 'E' }]),
  }));

  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

  const { default: Page } = await import('../pages/office/job-management/index.js');
  render(<Page />);

  await screen.findByText('Job #9');
  fireEvent.change(screen.getByLabelText('Engineer'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Scheduled Start'), {
    target: { value: '2024-01-02T10:00' },
  });
  fireEvent.change(screen.getByLabelText('Scheduled End'), {
    target: { value: '2024-01-02T11:00' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Schedule' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  expect(global.fetch.mock.calls[0][0]).toBe('/api/jobs/9/assign');
  const body = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(body.scheduled_start).toBe('2024-01-02T10:00');
  expect(body.scheduled_end).toBe('2024-01-02T11:00');
});
