import React from 'react';
import { shallow, mount } from 'enzyme';

import OData from './OData';

it('renders without crashing', () => {
  const mockHandler = jest.fn();
  mockHandler.mockReturnValue(<div />)

  const wrapper = shallow(<OData baseUrl="http://localhost">{mockHandler}</OData>);
});