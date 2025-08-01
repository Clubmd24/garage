/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('jobs fetch and display in calendar and side panel', async () => {
  const jobs = [
    {
      id: 1,
      scheduled_start: '2024-05-01T10:00:00Z',
      scheduled_end: '2024-05-01T11:00:00Z',
      status: 'awaiting assessment',
      assignments: [{ user_id: 2 }],
      licence_plate: 'AAA111',
    },
    { id: 2, status: 'unassigned', assignments: [], licence_plate: 'BBB222' },
  ];
  const fetchJobsInRange = jest.fn().mockResolvedValue(jobs);
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobsInRange,
    assignJob: jest.fn(),
  }));
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: {}, push: jest.fn(), isReady: true })
  }));
  const { default: Page } = await import('../pages/office/scheduling/index.js');
  render(<Page />);
  await screen.findByText('Job #1');
  expect(screen.getByTestId('side-panel')).toHaveTextContent('Job #2 – BBB222');
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const end = new Date();
  end.setDate(end.getDate() + 30);
  expect(fetchJobsInRange).toHaveBeenCalledWith(
    start.toLocaleDateString('en-CA'),
    end.toLocaleDateString('en-CA'),
    '',
    ''
  );
});

test('dragging unassigned job calls assign endpoint', async () => {
  const jobs = [{ id: 3, status: 'unassigned', assignments: [], licence_plate: 'CCC333' }];
  const assignMock = jest.fn().mockResolvedValue({});
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobsInRange: jest.fn().mockResolvedValue(jobs),
    assignJob: assignMock,
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([{ id: 1, username: 'E' }]),
  }));
  jest.unstable_mockModule('../lib/jobStatuses', () => ({
    fetchJobStatuses: jest.fn().mockResolvedValue([{ id: 2, name: 'in progress' }]),
  }));
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: {}, push: jest.fn(), isReady: true })
  }));
  const { default: Page } = await import('../pages/office/scheduling/index.js');
  render(<Page />);
  const item = await screen.findByTestId('unassigned-job');
  fireEvent.dragStart(item);
  await act(() => {
    window.__scheduleDrop({ start: new Date('2024-05-02T09:00:00Z'), end: new Date('2024-05-02T10:00:00Z') });
    return Promise.resolve();
  });
  const modal = await screen.findByTestId('assign-modal');
  expect(modal).toBeInTheDocument();
  expect(assignMock).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Engineer'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'in progress' } });
  fireEvent.click(screen.getByRole('button', { name: 'Assign' }));
  await act(() => Promise.resolve());
  expect(assignMock).toHaveBeenCalledWith(
    3,
    expect.objectContaining({
      engineer_id: 1,
      status: 'in progress',
      scheduled_start: '2024-05-02T09:00:00.000Z',
      scheduled_end: '2024-05-02T10:00:00.000Z',
    })
  );
});

test('dragging cancelled does not assign job', async () => {
  const jobs = [{ id: 4, status: 'unassigned', assignments: [], licence_plate: 'DDD444' }];
  const assignMock = jest.fn().mockResolvedValue({});
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobsInRange: jest.fn().mockResolvedValue(jobs),
    assignJob: assignMock,
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([]),
  }));
  jest.unstable_mockModule('../lib/jobStatuses', () => ({
    fetchJobStatuses: jest.fn().mockResolvedValue([]),
  }));
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: {}, push: jest.fn(), isReady: true })
  }));
  const { default: Page } = await import('../pages/office/scheduling/index.js');
  render(<Page />);
  const item = await screen.findByTestId('unassigned-job');
  fireEvent.dragStart(item);
  await act(() => {
    window.__scheduleDrop({ start: new Date('2024-05-03T09:00:00Z'), end: new Date('2024-05-03T10:00:00Z') });
    return Promise.resolve();
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await act(() => Promise.resolve());
  expect(assignMock).not.toHaveBeenCalled();
});

test('changing filters reloads jobs', async () => {
  const jobs = [];
  const fetchMock = jest.fn().mockResolvedValue(jobs);
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobsInRange: fetchMock,
    assignJob: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([{ id: 1, username: 'E' }]),
  }));
  jest.unstable_mockModule('../lib/jobStatuses', () => ({
    fetchJobStatuses: jest.fn().mockResolvedValue([{ id: 2, name: 'done' }]),
  }));
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: {}, push: jest.fn(), isReady: true })
  }));
  const { default: Page } = await import('../pages/office/scheduling/index.js');
  render(<Page />);
  await act(() => Promise.resolve());
  fireEvent.change(screen.getByLabelText('Engineer Filter'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Status Filter'), { target: { value: 'done' } });
  await act(() => Promise.resolve());
  const s = new Date();
  s.setDate(s.getDate() - 7);
  const e = new Date();
  e.setDate(e.getDate() + 30);
  expect(fetchMock).toHaveBeenLastCalledWith(
    s.toLocaleDateString('en-CA'),
    e.toLocaleDateString('en-CA'),
    '1',
    'done'
  );
});

test('assign with duration computes end time', async () => {
  const initialJobs = [
    { id: 6, status: 'unassigned', assignments: [], licence_plate: 'EEE555' },
  ];
  const scheduledJob = {
    id: 6,
    status: 'awaiting assessment',
    assignments: [{ user_id: 1 }],
    licence_plate: 'EEE555',
    scheduled_start: '2024-05-04T09:00:00.000Z',
    scheduled_end: '2024-05-04T10:30:00.000Z',
  };
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce(initialJobs)
    .mockResolvedValueOnce([scheduledJob]);
  const assignMock = jest.fn().mockImplementation(async (id, data) => {
    expect(data.scheduled_end).toBeUndefined();
    expect(data.duration).toBe('90');
    return scheduledJob;
  });
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobsInRange: fetchMock,
    assignJob: assignMock,
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([{ id: 1, username: 'E' }]),
  }));
  jest.unstable_mockModule('../lib/jobStatuses', () => ({
    fetchJobStatuses: jest.fn().mockResolvedValue([{ id: 2, name: 'in progress' }]),
  }));
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: {}, push: jest.fn(), isReady: true })
  }));
  const { default: Page } = await import('../pages/office/scheduling/index.js');
  render(<Page />);
  const item = await screen.findByTestId('unassigned-job');
  fireEvent.dragStart(item);
  await act(() => {
    window.__scheduleDrop({
      start: new Date('2024-05-04T09:00:00Z'),
      end: new Date('2024-05-04T10:30:00Z'),
    });
    return Promise.resolve();
  });
  fireEvent.change(screen.getByLabelText('Engineer'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'in progress' } });
  fireEvent.click(screen.getByRole('button', { name: 'Assign' }));
  await act(() => Promise.resolve());
  expect(assignMock).toHaveBeenCalledWith(
    6,
    expect.objectContaining({
      engineer_id: 1,
      status: 'in progress',
      scheduled_start: '2024-05-04T09:00:00.000Z',
      duration: '90',
    })
  );
  await screen.findByText('Job #6');
});
