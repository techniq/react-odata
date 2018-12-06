import React, { useState } from 'react';
import { useFetch } from 'react-fetch-component';
import buildQuery from 'odata-query';

import { isFunction } from './utils';

const ODataContext = React.createContext({});

function buildUrl(baseUrl, query) {
  return query !== false && baseUrl + buildQuery(query);
}

function useOData({ baseUrl, defaultQuery, query, ...props }) {
  const [state, setState] = useState({
    query: defaultQuery
  });
  state.setQuery = (updater, cb) =>
    setState(
      prevState => ({
        query: {
          ...prevState.query,
          ...(updater === 'function' ? updater(prevState) : updater)
        }
      }),
      cb
    );

  const fetchState = useFetch({
    url: query !== false && buildUrl(baseUrl, { ...query, ...state.query }),
    fetchFunction: (url, options, updateOptions) => {
      url = typeof url === 'string' ? url : buildUrl(baseUrl, url);
      return fetch(url, options, updateOptions);
    },
    ...props
  });

  return { ...fetchState, ...state };
}

const OData = ({ children, ...props }) => (
  <ODataContext.Provider value={useOData(props)}>
    {isFunction(children) ? (
      <ODataContext.Consumer>{children}</ODataContext.Consumer>
    ) : (
      children
    )}
  </ODataContext.Provider>
);
OData.Consumer = ODataContext.Consumer;

export { useOData, buildQuery };
export default OData;
