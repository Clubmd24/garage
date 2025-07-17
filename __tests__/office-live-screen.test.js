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


test('LiveScreen lists todays jobs with details', async () => {
  const date = new Date();
  const today = date.toLocaleDateString('en-CA');
  const jobs = [
    {
      id: 1,
      licence_plate: 'AAA111',
      make: 'Ford',
      model: 'Focus',
      engineers: 'Bob',
      status: 'in progress',
      scheduled_start: '2024-01-01T10:00:00Z',
      defect_description: 'leak'
    }
  ];
  const fetchJobsForDate = jest.fn().mockResolvedValue(jobs);

  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJobsForDate
  }));

  const { default: Page } = await import('../pages/office/live-screen/index.js');
  render(<Page />);

  await screen.findByText('AAA111');
  expect(screen.getByText('Ford Focus')).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
  const link = screen.getByRole('link', { name: 'View Job' });
  expect(link).toHaveAttribute('href', '/office/jobs/1');
  expect(fetchJobsForDate).toHaveBeenCalledWith(today);
});

