import React, { Component } from 'react';
import Fetch from 'react-fetch-component';
import buildQuery from 'odata-query';

function buildUrl(baseUrl, query) {
  return query !== false && baseUrl + buildQuery(query);
}

class OData extends Component {
  render() {
    const { baseUrl, query = {}, ...rest } = this.props;

    return (
      <Fetch
        url={buildUrl(baseUrl, query)}
        fetchFunction={(url, options, updateOptions) => {
          url = typeof url === 'string' ? url : buildUrl(baseUrl, url);
          return fetch(url, options, updateOptions);
        }}
        {...rest}
      />
    );
  }
}

export { buildQuery };
export default OData;
