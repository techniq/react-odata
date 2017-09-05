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

it('supports manually fetching data when "manual" prop set and "fetch" is called', async () => {
  const url = 'http://localhost';
  const data = { hello: 'world' };
  fetchMock.once(url, data);

  let savedProps = null;

  const mockChildren = jest.fn(props => {
    savedProps = props;
    return <div></div>
  });

  const wrapper = mount(<OData baseUrl="http://localhost" manual>{mockChildren}</OData>);
  const fetchComponent = wrapper.find('Fetch').getNode();

  await Promise.all(fetchComponent.promises); // no request made
  savedProps.fetch();
  await Promise.all(fetchComponent.promises);

  // Once for initial and once for loading, but should not be called when the response is returned 
  expect(mockChildren.mock.calls.length).toBe(3);

  // Initial state
  expect(mockChildren.mock.calls[0][0]).toMatchObject({ loading: null, request: {} });

  // Loading...
  expect(mockChildren.mock.calls[1][0]).toMatchObject({ loading: true, request: {} });
  
  // Data returned
  expect(mockChildren.mock.calls[2][0]).toMatchObject({ loading: false, data, request: {}, response: {} });

  expect(fetchMock.called(url)).toBe(true);
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

  const wrapper = mount(<OData baseUrl="http://localhost" query={{ top: 10 }} manual>{mockChildren}</OData>);
  const fetchComponent = wrapper.find('Fetch').getNode();

  await Promise.all(fetchComponent.promises); // no request made
  savedProps.fetch();
  await Promise.all(fetchComponent.promises);

  // Once for initial and once for loading, but should not be called when the response is returned 
  expect(mockChildren.mock.calls.length).toBe(3);

  // Initial state
  expect(mockChildren.mock.calls[0][0]).toMatchObject({ loading: null, request: {} });
  
  // Loading...
  expect(mockChildren.mock.calls[1][0]).toMatchObject({ loading: true, request: {} });
    
  // Data returned
  expect(mockChildren.mock.calls[2][0]).toMatchObject({ loading: false, data, request: {}, response: {} });
  
  expect(fetchMock.called(url)).toBe(true);
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

  const wrapper = mount(<OData baseUrl="http://localhost" query={{ top: 10 }}>{mockChildren}</OData>);
  const fetchComponent = wrapper.find('Fetch').getNode();

  await Promise.all(fetchComponent.promises); // no request made
  savedProps.fetch({ top: 10, skip: 10 });
  await Promise.all(fetchComponent.promises);

  // Once for initial and once for loading, but should not be called when the response is returned 
  expect(mockChildren.mock.calls.length).toBe(5);

  // Initial state
  expect(mockChildren.mock.calls[0][0]).toMatchObject({ loading: null, request: {} });

  // Loading...
  expect(mockChildren.mock.calls[1][0]).toMatchObject({ loading: true, request: {} });
  
  // Data returned
  expect(mockChildren.mock.calls[2][0]).toMatchObject({ loading: false, data: data1, request: {}, response: {} });

  // Loading...
  expect(mockChildren.mock.calls[3][0]).toMatchObject({ loading: true, request: {} });

  // Data returned
  expect(mockChildren.mock.calls[4][0]).toMatchObject({ loading: false, data: data2, request: {}, response: {} });

  expect(fetchMock.called(url1)).toBe(true);
  expect(fetchMock.called(url2)).toBe(true);
});