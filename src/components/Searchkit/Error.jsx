import { useSelector } from 'react-redux';
import { Header, Segment } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const Error = ({ error }) => {
  const stateError = useSelector((state) => state.results?.error);

  return stateError?.name ? (
    <Segment inverted color="red" secondary>
      <Header icon>
        <h3>
          <FormattedMessage
            id="Check the configuration of your searchkit block!"
            defaultMessage="Check the configuration of your searchkit block!"
          />
        </h3>
      </Header>
      <b>{stateError?.name}:</b> <i>{stateError?.message}</i>
    </Segment>
  ) : null;
};

export default Error;
