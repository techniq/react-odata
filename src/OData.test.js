import React from 'react';
import { render, wait } from 'react-testing-library';
import fetchMock from 'fetch-mock';

import OData from './OData';

afterEach(fetchMock.restore);

it('fetches all if query is not set', async () => {
  const data = { hello: 'world' };
  fetchMock.once('*', data);

  const mockHandler = jest.fn();
  mockHandler.mockReturnValue(<div />)

  const {} = render(<OData baseUrl="http://localhost">{mockHandler}</OData>);

  await wait(() => expect(mockHandler.mock.calls.length).toBe(3));

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

  const {} = render(<OData baseUrl="http://localhost" query={false}>{mockHandler}</OData>);

  await wait(() => expect(mockHandler.mock.calls.length).toBe(1));

  // Initial state
  expect(mockHandler.mock.calls[0][0]).toMatchObject({ loading: null });

  expect(fetchMock.called('*')).toBe(false);
});

it('supports manually fetching data when "manual" prop set and "fetch" is called', async () => {
  const url = 'http://localhost';
  const data = { hello: 'world' };
  fetchMock.once(url, data);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div></div>
  });

  const {} = render(<OData baseUrl="http://localhost" manual>{mockChildren}</OData>);

  expect(fetchMock.called(url)).toBe(false);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(1)); // initial state
  expect(mockChildren.mock.calls[0][0]).toMatchObject({ loading: null, request: {} });

  savedProps.fetch();

  expect(fetchMock.called(url)).toBe(true);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3)); // loading / data
  expect(mockChildren.mock.calls[1][0]).toMatchObject({ loading: true, request: {} });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({ loading: false, data, request: {}, response: {} });
});

it('passes original query props if "fetch" function does not provide different', async () => {
  const url = 'http://localhost?$top=10';
  const data = { name: 'foo' };
  fetchMock.get(url, data);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div></div>
  });

  const {} = render(<OData baseUrl="http://localhost" query={{ top: 10 }} manual>{mockChildren}</OData>);

  expect(fetchMock.called(url)).toBe(false);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(1)); // initial loading
  expect(mockChildren.mock.calls[0][0]).toMatchObject({ loading: null, request: {} });

  savedProps.fetch();

  expect(fetchMock.called(url)).toBe(true);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3)); // loading / data
  expect(mockChildren.mock.calls[1][0]).toMatchObject({ loading: true, request: {} });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({ loading: false, data, request: {}, response: {} });
});

it('supports passing query props to "fetch" function', async () => {
  const url1 = 'http://localhost?$top=10';
  const data1 = { name: 'foo' };
  fetchMock.get(url1, data1);
  const url2 = 'http://localhost?$top=10&$skip=10';
  const data2 = { name: 'bar' };
  fetchMock.get(url2, data2);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div></div>
  });

  const {} = render(<OData baseUrl="http://localhost" query={{ top: 10 }}>{mockChildren}</OData>);

  expect(fetchMock.called(url1)).toBe(true);
  expect(fetchMock.called(url2)).toBe(false);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3));
  expect(mockChildren.mock.calls[0][0]).toMatchObject({ loading: null, request: {} });
  expect(mockChildren.mock.calls[1][0]).toMatchObject({ loading: true, request: {} });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({ loading: false, data: data1, request: {}, response: {} });

  savedProps.fetch({ top: 10, skip: 10 });

  expect(fetchMock.called(url2)).toBe(true);

  await wait(() => expect(mockChildren.mock.calls.length).toBe(5));
  expect(mockChildren.mock.calls[3][0]).toMatchObject({ loading: true, request: {} });
  expect(mockChildren.mock.calls[4][0]).toMatchObject({ loading: false, data: data2, request: {}, response: {} });
});