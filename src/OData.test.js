import React from 'react';
import { render, wait, Simulate } from 'react-testing-library';
import fetchMock from 'fetch-mock';

import OData from './OData';

afterEach(fetchMock.restore);

it('fetches all if query is not set', async () => {
  const data = { hello: 'world' };
  fetchMock.once('*', data);

  const mockHandler = jest.fn();
  mockHandler.mockReturnValue(<div />);

  const {} = render(<OData baseUrl="http://localhost">{mockHandler}</OData>);

  await wait(() => expect(mockHandler.mock.calls.length).toBe(3));

  // Initial state
  expect(mockHandler.mock.calls[0][0]).toMatchObject({ loading: null });

  // Loading...
  expect(mockHandler.mock.calls[1][0]).toMatchObject({
    loading: true,
    request: {}
  });

  // Data loaded
  expect(mockHandler.mock.calls[2][0]).toMatchObject({
    loading: false,
    data,
    request: {},
    response: {}
  });

  expect(fetchMock.called('*')).toBe(true);
});

it('does not fetch if query is false', async () => {
  const data = { hello: 'world' };
  fetchMock.once('*', data);

  const mockHandler = jest.fn();
  mockHandler.mockReturnValue(<div />);

  const {} = render(
    <OData baseUrl="http://localhost" query={false}>
      {mockHandler}
    </OData>
  );

  await wait(() => expect(mockHandler.mock.calls.length).toBe(1));

  // Initial state
  expect(mockHandler.mock.calls[0][0]).toMatchObject({ loading: null });

  expect(fetchMock.called('*')).toBe(false);
});

it('does not re-fetch if `query` changed to false', async () => {
  const url = 'http://localhost?$top=10';
  const data = { name: 'foo' };
  fetchMock.get(url, data);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div />;
  });

  const { rerender } = render(
    <OData baseUrl="http://localhost" query={{ top: 10 }}>
      {mockChildren}
    </OData>
  );

  expect(fetchMock.called(url)).toBe(true);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3));
  expect(mockChildren.mock.calls[0][0]).toMatchObject({
    loading: null,
    request: {}
  });
  expect(mockChildren.mock.calls[1][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({
    loading: false,
    data,
    request: {},
    response: {}
  });

  rerender(
    <OData baseUrl="http://localhost" query={false}>
      {mockChildren}
    </OData>
  );
  expect(mockChildren.mock.calls.length).toBe(4);

  expect(fetchMock.calls(url).length).toBe(1);
});

it('supports manually fetching data when "manual" prop set and "fetch" is called', async () => {
  const url = 'http://localhost';
  const data = { hello: 'world' };
  fetchMock.once(url, data);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div />;
  });

  const {} = render(
    <OData baseUrl="http://localhost" manual>
      {mockChildren}
    </OData>
  );

  expect(fetchMock.called(url)).toBe(false);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(1)); // initial state
  expect(mockChildren.mock.calls[0][0]).toMatchObject({
    loading: null,
    request: {}
  });

  savedProps.fetch();

  expect(fetchMock.called(url)).toBe(true);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3)); // loading / data
  expect(mockChildren.mock.calls[1][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({
    loading: false,
    data,
    request: {},
    response: {}
  });
});

it('passes original query props if "fetch" function does not provide different', async () => {
  const url = 'http://localhost?$top=10';
  const data = { name: 'foo' };
  fetchMock.get(url, data);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div />;
  });

  const {} = render(
    <OData baseUrl="http://localhost" query={{ top: 10 }} manual>
      {mockChildren}
    </OData>
  );

  expect(fetchMock.called(url)).toBe(false);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(1)); // initial loading
  expect(mockChildren.mock.calls[0][0]).toMatchObject({
    loading: null,
    request: {}
  });

  savedProps.fetch();

  expect(fetchMock.called(url)).toBe(true);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3)); // loading / data
  expect(mockChildren.mock.calls[1][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({
    loading: false,
    data,
    request: {},
    response: {}
  });
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
    return <div />;
  });

  const {} = render(
    <OData baseUrl="http://localhost" query={{ top: 10 }}>
      {mockChildren}
    </OData>
  );

  expect(fetchMock.called(url1)).toBe(true);
  expect(fetchMock.called(url2)).toBe(false);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3));
  expect(mockChildren.mock.calls[0][0]).toMatchObject({
    loading: null,
    request: {}
  });
  expect(mockChildren.mock.calls[1][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({
    loading: false,
    data: data1,
    request: {},
    response: {}
  });

  savedProps.fetch({ top: 10, skip: 10 });

  expect(fetchMock.called(url2)).toBe(true);

  await wait(() => expect(mockChildren.mock.calls.length).toBe(5));
  expect(mockChildren.mock.calls[3][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[4][0]).toMatchObject({
    loading: false,
    data: data2,
    request: {},
    response: {}
  });
});

it('does not re-fetch if `query` does not change and component is re-rendered', async () => {
  const url = 'http://localhost?$top=10';
  const data = { name: 'foo' };
  fetchMock.get(url, data);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div />;
  });

  const { rerender } = render(
    <OData baseUrl="http://localhost" query={{ top: 10 }}>
      {mockChildren}
    </OData>
  );

  expect(fetchMock.called(url)).toBe(true);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3));
  expect(mockChildren.mock.calls[0][0]).toMatchObject({
    loading: null,
    request: {}
  });
  expect(mockChildren.mock.calls[1][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({
    loading: false,
    data,
    request: {},
    response: {}
  });

  rerender(
    <OData baseUrl="http://localhost" query={{ top: 10 }}>
      {mockChildren}
    </OData>
  );
  expect(mockChildren.mock.calls.length).toBe(4);

  expect(fetchMock.calls(url).length).toBe(1);
});

it('supports passing `defaultQuery` prop', async () => {
  const url = 'http://localhost?$top=10';
  const data = { name: 'foo' };
  fetchMock.get(url, data);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div />;
  });

  const {} = render(
    <OData baseUrl="http://localhost" defaultQuery={{ top: 10 }}>
      {mockChildren}
    </OData>
  );

  expect(fetchMock.called(url)).toBe(true);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3)); // initial, loading, data
  expect(mockChildren.mock.calls[0][0]).toMatchObject({
    loading: null,
    request: {}
  });
  expect(mockChildren.mock.calls[1][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({
    loading: false,
    data,
    request: {},
    response: {}
  });
});

it('supports updating query via context', async () => {
  const url1 = 'http://localhost?$top=10';
  const data1 = { name: 'foo' };
  fetchMock.get(url1, data1);
  const url2 = 'http://localhost?$top=10&$skip=10';
  const data2 = { name: 'bar' };
  fetchMock.get(url2, data2);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return (
      <div>
        <OData.Consumer>
          {({ setQuery }) => (
            <button onClick={() => setQuery({ skip: 10 })}>Click me</button>
          )}
        </OData.Consumer>
      </div>
    );
  });

  const { getByText } = render(
    <OData baseUrl="http://localhost" query={{ top: 10 }}>
      {mockChildren}
    </OData>
  );

  expect(fetchMock.called(url1)).toBe(true);
  expect(fetchMock.called(url2)).toBe(false);
  await wait(() => expect(mockChildren.mock.calls.length).toBe(3));
  expect(mockChildren.mock.calls[0][0]).toMatchObject({
    loading: null,
    request: {}
  });
  expect(mockChildren.mock.calls[1][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[2][0]).toMatchObject({
    loading: false,
    data: data1,
    request: {},
    response: {}
  });

  Simulate.click(getByText('Click me'));

  expect(fetchMock.called(url2)).toBe(true);

  await wait(() => expect(mockChildren.mock.calls.length).toBe(6));
  expect(mockChildren.mock.calls[3][0]).toMatchObject({
    loading: false
  });
  expect(mockChildren.mock.calls[4][0]).toMatchObject({
    loading: true,
    request: {}
  });
  expect(mockChildren.mock.calls[5][0]).toMatchObject({
    loading: false,
    data: data2,
    request: {},
    response: {}
  });
});
