import React from 'react';
import { Container, Segment, Input } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { Icon as IconNext } from '@plone/volto/components';
import backSVG from '@plone/volto/icons/back.svg';

import {
  // BucketAggregation,
  // EmptyResults,
  // Error,
  onQueryChanged,
  ReactSearchKit,
  // ResultsLoader,
  // SearchBar,
  // withState,
  // updateQueryString,
} from 'react-searchkit';
import { ploneSearchApi } from './FacetedSearch';

const TestSearchkitQuerystrings = (props) => {
  const searchconfig = {
    elastic_search_api_url: 'http://localhost:9200',
    elastic_search_api_index: 'plone2020',
    reviewstatemapping: {
      Manual: ['internally_published', 'private', 'internal'],
    },
    withExtraExactField: true,
    simpleFields: [
      'title^1.4',
      'description^1.2',
      'subjects^1.4',
      'freemanualtags_searchable^1.4',
      'blocks_plaintext',
      'manualfilecontent',
    ],
    nestedFields: [],
  };

  const initialState = {
    // sortBy: 'bestmatch',
    // sortOrder: 'asc',
    sortBy: 'modified',
    sortOrder: 'desc',
    queryString: '',
    layout: 'list',
    page: 1,
    size: 10,
  };

  const onchangehandler = (event, data) => {
    let searchQuery = {
      ...initialState,
      queryString: data.value,
    };
    onQueryChanged({ searchQuery: searchQuery });
    return;
  };

  return (
    <Container>
      <h1>TestSearchkitQuerystrings</h1>
      <ReactSearchKit
        searchApi={ploneSearchApi(searchconfig)}
        eventListenerEnabled={true}
        initialQueryState={initialState}
      >
        <Segment>
          <Input
            id="my-field"
            title="some strings to search for"
            onChange={(event, data) => {
              onchangehandler(event, data);
            }}
          />
        </Segment>
      </ReactSearchKit>
      <Link to="/controlpanel" className="item">
        <IconNext
          name={backSVG}
          className="contents circled"
          size="30px"
          title="back"
        />
      </Link>
    </Container>
  );
};

export default TestSearchkitQuerystrings;
