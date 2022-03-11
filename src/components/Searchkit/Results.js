/*
 * This file is part of React-SearchKit.
 * Copyright (C) 2019 CERN.
 *
 * React-SearchKit is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from 'react';
import { Grid, Icon as IconSemantic } from 'semantic-ui-react';
import { Count, Pagination, ResultsMultiLayout, Sort } from 'react-searchkit';

import config from '@plone/volto/registry';

// TODO conditional Matomo tracking: catch case if app has not volto-matomo installed
import { trackSiteSearch } from '@eeacms/volto-matomo/utils';

export class Results extends Component {
  componentDidMount() {
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
          </Grid.Column>
          <Grid.Column width={6}>
            <Sort
              className="sortdropdown"
              values={this.props.sortValues}
              label={(cmp) => <> {cmp}</>}
              overridableId="volto"
            />
          </Grid.Column>
          <Grid.Column width={4}></Grid.Column>
        </Grid>
        <Grid style={{ padding: '2em 0' }}>
          <ResultsMultiLayout overridableId="elasticsearch" />
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
