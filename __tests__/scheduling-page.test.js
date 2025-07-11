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
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobsInRange: jest.fn().mockResolvedValue(jobs),
    assignJob: jest.fn(),
  }));
  const { default: Page } = await import('../pages/office/scheduling/index.js');
  render(<Page />);
  await screen.findByText('Job #1');
  expect(screen.getByTestId('side-panel')).toHaveTextContent('Job #2 – BBB222');
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
  expect(assignMock).toHaveBeenCalledWith(3, expect.objectContaining({ engineer_id: 1, status: 'in progress' }));
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
  const { default: Page } = await import('../pages/office/scheduling/index.js');
  render(<Page />);
  await act(() => Promise.resolve());
  fireEvent.change(screen.getByLabelText('Engineer Filter'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Status Filter'), { target: { value: 'done' } });
  await act(() => Promise.resolve());
  expect(fetchMock).toHaveBeenLastCalledWith(expect.any(String), expect.any(String), '1', 'done');
});
