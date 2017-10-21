import React, { Component } from 'react';
import Fetch, { renderChildren } from 'react-fetch-component';
import buildQuery from 'odata-query';

function buildUrl(baseUrl, query) {
  return query !== false && baseUrl + buildQuery(query);
}

class OData extends Component {
  render() {
    const { baseUrl, query, children, ...rest } = this.props;
    const url = buildUrl(baseUrl, query);

    return (
      <Fetch url={url} {...rest}>
        {({ fetch, ...props }) => {
          return renderChildren(children, {
            ...props,
            fetch: (query, options, updateOptions) =>
              fetch(
                buildUrl(baseUrl, query || this.props.query),
                options || this.props.options,
                updateOptions
              )
          });
        }}
      </Fetch>
    );
  }
}

export { buildQuery, renderChildren };
export default OData;
