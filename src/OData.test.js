import React from 'react';
import { shallow, mount } from 'enzyme';
import fetchMock from 'fetch-mock';

import OData from './OData';

afterEach(fetchMock.restore);

it('fetches all if query is not not', async () => {
  const data = { hello: 'world' };
  fetchMock.once('*', data);

  const mockHandler = jest.fn();
  mockHandler.mockReturnValue(<div />)

  const wrapper = mount(<OData baseUrl="http://localhost">{mockHandler}</OData>);
  const fetchComponent = wrapper.find('Fetch').getNode();

  await Promise.all(fetchComponent.promises);

  expect(mockHandler.mock.calls.length).toBe(3);

  // Initial state
  expect(mockHandler.mock.calls[0][0]).toMatchObject({ loading: null });

  // Loading...
  expect(mockHandler.mock.calls[1][0]).toMatchObject({ loading: true, request: {} });

  // Data loaded
  expect(mockHandler.mock.calls[2][0]).toMatchObject({ loading: false, data, request: {}, response: {} });

  expect(fetchMock.called('*')).toBe(true);
});

it('does not fetch if query is false', async () => {
  const data = { hello: 'world' };
  fetchMock.once('*', data);

  const mockHandler = jest.fn();
  mockHandler.mockReturnValue(<div />)

  const wrapper = mount(<OData baseUrl="http://localhost" query={false}>{mockHandler}</OData>);
  const fetchComponent = wrapper.find('Fetch').getNode();

  expect(fetchComponent.promises).toEqual([]);

  expect(mockHandler.mock.calls.length).toBe(1);

  // Initial state
  expect(mockHandler.mock.calls[0][0]).toMatchObject({ loading: null });

  expect(fetchMock.called('*')).toBe(false);
});