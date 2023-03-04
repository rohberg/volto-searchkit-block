import React from 'react';
import { withState } from 'react-searchkit';

class _StateLogger extends React.Component {
  render() {
    return (
      <div>
        <div>
          <h2>Current results state</h2>
          <pre>{JSON.stringify(this.props.currentResultsState, null, 2)}</pre>
        </div>
        <div>
          <h2>Current query state</h2>
          <pre>{JSON.stringify(this.props.currentQueryState, null, 2)}</pre>
        </div>
      </div>
    );
  }
}

const StateLogger = withState(_StateLogger);

export default StateLogger;
