import React, { useState } from 'react';
import Fetch, { useFetch, FetchContext } from 'react-fetch-component';
import {QueryBuilder} from 'odata-query-builder';

import { isFunction, isEmpty } from './utils';

function buildUrl(baseUrl, query) {
  return query !== false && baseUrl + (isEmpty(query) ? '' : query.toQuery());
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
          ...(isFunction(updater) ? updater(prevState.query) : updater)
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

const POData = ({ children, ...props }) => {
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
POData.Consumer = FetchContext.Consumer;

export { useOData, QueryBuilder };
export default POData;
