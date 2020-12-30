/*
 * This file is part of React-SearchKit.
 * Copyright (C) 2019 CERN.
 *
 * React-SearchKit is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import {
  ActiveFilters,
  Count,
  Pagination,
  ResultsMultiLayout,
} from 'react-searchkit';


export class Results extends Component {
  render() {
    const { total } = this.props.currentResultsState.data;
    return total ? (
      <div className="fnresults">
        {/* <Grid relaxed>
          <ActiveFilters />
        </Grid> */}
        <Grid>
          <Grid.Column width={4}>
            <Count />
          </Grid.Column>
          <Grid.Column width={8} textAlign="right">
            <div></div>
          </Grid.Column>
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
