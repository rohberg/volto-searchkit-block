import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';

import Error from './Error';

beforeAll(() => {});

const mockStore = configureStore();

describe('Generic Error', () => {
  it('renders a simple error component', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
      results: {
        error: {
          name: 'NotFoundError',
          message: 'Index cannot be found.',
        },
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <MemoryRouter>
          <Error error={{ status: 401, message: 'Unauthorized' }} />
        </MemoryRouter>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
