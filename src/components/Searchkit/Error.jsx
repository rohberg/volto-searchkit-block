import { useSelector } from 'react-redux';
import { Header, Segment } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const Error = () => {
  const error = useSelector((state) => state.results?.error);

  return (
    <Segment>
      <Header icon>
        <FormattedMessage
          id="Check the configuration of your searchkit block!"
          defaultMessage="Check the configuration of your searchkit block!"
        />
      </Header>
      <i>{error?.message}</i>
    </Segment>
  );
};

export default Error;
