import React, { Component } from 'react';
import Fetch from 'react-fetch-component';
import { buildQueryString } from './utilities';

class OData extends Component {
  render() {
    const { baseUrl, ...rest } = this.props;
    const queryString = buildQueryString(this.props);

    return (
      <Fetch url={`${baseUrl}?${queryString}`} {...rest} />
    )
  }
}

export default OData;