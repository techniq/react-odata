import React, { Component } from 'react';
import Fetch, { renderChildren } from 'react-fetch-component';
import buildQuery from 'odata-query';

function buildUrl(baseUrl, query) {
  return query !== false && baseUrl + buildQuery(query);
}

class OData extends Component {
  render() {
    const { baseUrl, query = {}, ...rest } = this.props;

    return (
      <Fetch
        url={query}
        fetchFunction={(query, options, updateOptions) => {
          const url = buildUrl(baseUrl, query);
          return fetch(url, options, updateOptions);
        }}
        {...rest}
      />
    );
  }
}

export { buildQuery, renderChildren };
export default OData;
