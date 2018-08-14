import React, { Component } from 'react';
import Fetch from 'react-fetch-component';
import buildQuery from 'odata-query';

const ODataContext = React.createContext({});

function buildUrl(baseUrl, query) {
  return query !== false && baseUrl + buildQuery(query);
}

class OData extends Component {
  static Consumer = ODataContext.Consumer;

  state = {
    query: this.props.defaultQuery,
    setQuery: (updater, cb) =>
      this.setState(
        prevState => ({
          query: {
            ...prevState.query,
            ...(updater === 'function' ? updater(prevState) : updater)
          }
        }),
        cb
      )
  };

  renderFetch(baseUrl, query, props) {
    return (
      <Fetch
        url={buildUrl(baseUrl, query)}
        fetchFunction={(url, options, updateOptions) => {
          url = typeof url === 'string' ? url : buildUrl(baseUrl, url);
          return fetch(url, options, updateOptions);
        }}
        {...props}
      />
    );
  }

  render() {
    const { baseUrl, defaultQuery, query, ...props } = this.props;
    const fetchComponent = this.renderFetch(
      baseUrl,
      this.props.query !== false && {
        ...this.props.query,
        ...this.state.query
      },
      props
    );

    return (
      <ODataContext.Provider value={this.state}>
        {typeof children === 'function' ? (
          <ODataContext.Consumer>{fetchComponent}</ODataContext.Consumer>
        ) : (
          fetchComponent
        )}
      </ODataContext.Provider>
    );
  }
}

export { buildQuery };
export default OData;
