import React, { Component } from 'react';
import Fetch from 'react-fetch-component';
import buildQuery from 'odata-query';

class OData extends Component {
  render() {
    const { baseUrl, query, ...rest } = this.props;
    const url = (query !== false) && baseUrl + buildQuery(query)

    return <Fetch url={url} {...rest} />
  }
}

export default OData;