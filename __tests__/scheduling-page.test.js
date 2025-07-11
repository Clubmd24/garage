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
  const { default: Page } = await import('../pages/office/scheduling/index.js');
  render(<Page />);
  const item = await screen.findByTestId('unassigned-job');
  fireEvent.dragStart(item);
  await act(() => {
    window.__scheduleDrop({ start: new Date('2024-05-02T09:00:00Z'), end: new Date('2024-05-02T10:00:00Z') });
    return Promise.resolve();
  });
  expect(assignMock).toHaveBeenCalled();
  expect(assignMock.mock.calls[0][0]).toBe(3);
});
