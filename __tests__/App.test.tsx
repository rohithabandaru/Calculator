/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('renders correctly', async () => {
  let renderer: any;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  
  // Flush any pending timers/animations
  await ReactTestRenderer.act(() => {
    jest.runAllTimers();
  });
});
