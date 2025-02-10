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
import * as matomoUtils from '@eeacms/volto-matomo/src/utils';

// import { scrollToTarget } from '../helpers';

class Results extends Component {
  componentDidMount() {
    // Dispatch event (on query change), other add-ons can subscribe to.
    var evt = new CustomEvent('searchkitQueryChanged', {
      detail: {
        queryString: this.props.currentQueryState.queryString,
        filters: this.props.currentQueryState.filters,
      },
    });
    window && window.dispatchEvent(evt);
    if (
      config.settings.searchkitblock.trackVoltoMatomo &&
      this.props.currentQueryState.queryString
    ) {
      const options = {
        ...config.settings.searchkitblock.trackSiteSearchOptions,
        keyword: this.props.currentQueryState.queryString,
        count: this.props.currentResultsState.data.total,
      };
      matomoUtils.trackSiteSearch(options);
    }
  }

  render() {
    const { total } = this.props.currentResultsState.data;
    return total ? (
      <div className="fnresults">
        <Grid>
          <Grid.Column width={4}>
            <Count />
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
          <Grid.Column width={12}>
            <ResultsMultiLayout layout="grid" overridableId="elasticsearch" />
          </Grid.Column>
        </Grid>
        <Grid verticalAlign="middle" textAlign="center">
          <Pagination options={{ size: 'small' }} />
        </Grid>
      </div>
    ) : null;
  }
}

Results.propTypes = {};

Results.defaultProps = {};

const MyResults = (props) => {
  // Add scroll to search input field
  // React.useEffect(() => {
  //   const el = document.querySelector('.searchkitsearch');
  //   if (el) {
  //     scrollToTarget(el);
  //   }
  // }, []);

  return <Results {...props} />;
};

export const OnResults = withState(MyResults);
