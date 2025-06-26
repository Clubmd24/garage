/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { highlightMentions } from '../lib/highlightMentions.js';

test('highlightMentions wraps mentions with highlight class', () => {
  const { container } = render(
    React.createElement('div', null, highlightMentions('hi @user-name!')),
  );
  const spans = container.querySelectorAll('span');
  expect(spans).toHaveLength(3);
  expect(spans[1].textContent).toBe('@user-name');
  expect(spans[1].className).toBe('text-[var(--color-mention)]');
  expect(container.textContent).toBe('hi @user-name!');
});

test('highlightMentions uses red class for @dashboard', () => {
  const { container } = render(
    React.createElement('div', null, highlightMentions('attention @dashboard!')),
  );
  const spans = container.querySelectorAll('span');
  expect(spans).toHaveLength(3);
  expect(spans[1].textContent).toBe('@dashboard');
  expect(spans[1].className).toBe('text-red-500');
  expect(container.textContent).toBe('attention @dashboard!');
});
