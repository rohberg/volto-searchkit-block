/*
 * This file is part of React-SearchKit.
 * Copyright (C) 2019 CERN.
 *
 * React-SearchKit is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import { Count, Pagination, ResultsMultiLayout, Sort } from 'react-searchkit';

export class Results extends Component {
  componentDidMount() {
    var evt = new CustomEvent('searchkitQueryChanged', {});
    window.dispatchEvent(evt);
  }

  render() {
    const { total } = this.props.currentResultsState.data;
    // console.log('Results Searchkit this.props.currentResultsState.data', total);
    return total ? (
      <div className="fnresults">
        {/* <Grid relaxed>
          <ActiveFilters />
        </Grid> */}
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
          <Pagination />
        </Grid>
      </div>
    ) : null;
  }
}

Results.propTypes = {};

Results.defaultProps = {};
