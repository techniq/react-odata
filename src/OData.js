import React, { useState } from 'react';
import Fetch, { useFetch, FetchContext } from 'react-fetch-component';
import buildQuery from 'odata-query';

import { isFunction } from './utils';

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

const OData = ({ children, ...props }) => {
  const state = useOData(props);
  return (
    <FetchContext.Provider value={state}>
      {isFunction(children) ? (
        <FetchContext.Consumer>{children}</FetchContext.Consumer>
      ) : (
        children
      )}
    </FetchContext.Provider>
  );
};
OData.Consumer = FetchContext.Consumer;

export { useOData, buildQuery };
export default OData;
