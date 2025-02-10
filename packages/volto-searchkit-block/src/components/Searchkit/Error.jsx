import { Header, Segment } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const Error = ({ error }) => {
  return error?.type ? (
    <Segment inverted color="red" secondary>
      <Header icon>
        <h3>
          <FormattedMessage
            id="Check the configuration of your searchkit block!"
            defaultMessage="Check the configuration of your searchkit block!"
          />
        </h3>
      </Header>
      <p>
        <b>{error?.type}:</b> <i>{error?.message}</i>
      </p>
      <p>
        <FormattedMessage
          id="If no index exists, reindex your content or just start by editing and saving a page."
          defaultMessage="If no index exists, reindex your content or just start by editing and saving a page."
        />
      </p>
    </Segment>
  ) : null;
};

export default Error;
