import React from 'react';
import { withState } from 'react-searchkit';

class _StateLogger extends React.Component {
  render() {
    return (
      <div>
        <div>
          Current query state <pre>{JSON.stringify(this.props.currentQueryState, null, 2)}</pre>
        </div>
        {/* <div>
          Current results state <pre>{JSON.stringify(this.props.currentResultsState, null, 2)}</pre>
        </div> */}
      </div>
    );
  }
}

const StateLogger = withState(_StateLogger);

export default StateLogger;
