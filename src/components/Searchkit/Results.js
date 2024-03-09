import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import {
  Count,
  Pagination,
  ResultsMultiLayout,
  Sort,
  withState,
} from 'react-searchkit';

import config from '@plone/volto/registry';

// TODO conditional Matomo tracking: catch case if app has not volto-matomo installed
import { trackSiteSearch } from '@eeacms/volto-matomo/utils';

import { scrollToTarget } from '../helpers';

class Results extends Component {
  componentDidMount() {
    // Dispatch event (on query change), other add-ons can subscribe to.
    var evt = new CustomEvent('searchkitQueryChanged', {});
    window && window.dispatchEvent(evt);
    if (
      config.settings.searchkitblock.trackVoltoMatomo &&
      this.props.currentQueryState.queryString
    ) {
      let options = {
        keyword: this.props.currentQueryState.queryString,
        category: 'Suche in Dokumentation', // optional
        // count: 4, // optional
        documentTitle: 'Suche in Dokumentation', // optional
        href: '/search', // optional
        count: this.props.currentResultsState.data.total,
        // customDimensions: [
        //   {
        //     id: 1,
        //     value: 'loggedIn',
        //   },
        // ], // optional
      };
      trackSiteSearch(options);
    }
  }

  render() {
    const { total } = this.props.currentResultsState.data;
    return total ? (
      <div className="fnresults">
        <Grid>
          <Grid.Column width={4}>
            <Count />
            <div>DEBUG1 {JSON.stringify(this.props.currentResultsState?.error)}</div>
          </Grid.Column>
          <Grid.Column width={6}>
            <Sort
              className="sortdropdown"
              values={this.props.sortValues}
              label={(cmp) => <> {cmp}</>}
              overridableId="volto"
            />
          </Grid.Column>
        </Grid>
        <Grid style={{ padding: '2em 0' }}>
          <ResultsMultiLayout overridableId="elasticsearch" />
        </Grid>
        <Grid verticalAlign="middle" textAlign="center">
          <Pagination options={{ size: 'small' }} />
        </Grid>
      </div>
    ) : <div>DEBUG2 {JSON.stringify(this.props.currentResultsState?.error)}</div>;
  }
}

Results.propTypes = {};

Results.defaultProps = {};

const MyResults = (props) => {
  // Add scroll to input field search
  React.useEffect(() => {
    const el = document.querySelector('.searchkitsearch');
    if (el) {
      scrollToTarget(el);
    }
  }, []);

  return <Results {...props} />;
};

export const OnResults = withState(MyResults);
