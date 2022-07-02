import React from 'react';
import { Container, Segment, Input } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { OverridableContext } from 'react-overridable';

import { Icon as IconNext } from '@plone/volto/components';
import backSVG from '@plone/volto/icons/back.svg';

import {
  // BucketAggregation,
  // EmptyResults,
  // Error,
  onQueryChanged,
  ReactSearchKit,
  // ResultsLoader,
  SearchBar,
  withState,
  // updateQueryString,
  ResultsMultiLayout,
  Count,
} from 'react-searchkit';
import { ploneSearchApi } from './FacetedSearch';
import ElasticSearchHighlights from './ElasticSearchHighlights';

const OnResults = withState(ResultsMultiLayout);

const CustomResultsListItem = ({ result, index }) => {
  return (
    <div>
      <h2>
        <a href={result['@id']}>{result.title}</a>
      </h2>
      <ElasticSearchHighlights
        highlight={result.highlight}
        indexResult={index}
      />
    </div>
  );
};

const overriddenComponents = {
  'ResultsList.item': CustomResultsListItem,
};

const TestSearchkitQuerystrings = (props) => {
  console.debug('TestSearchkitQuerystrings. props', props);
  const searchconfig = {
    elastic_search_api_url: 'http://localhost:9200',
    elastic_search_api_index: 'plone2020',
    // reviewstatemapping: {
    //   Manual: ['internally_published', 'private', 'internal'],
    // },
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
    backend_url: 'http://localhost:8080/Plone',
    frontend_url: 'http://igib.example.com',
  };

  const initialState = {
    // sortBy: 'bestmatch',
    // sortOrder: 'asc',
    sortBy: 'modified',
    sortOrder: 'desc',
    queryString: '',
    layout: 'list',
    page: 1,
    size: 50,
  };

  const onchangehandler = (event, data) => {
    let searchQuery = {
      ...initialState,
      queryString: data.value,
    };
    onQueryChanged({ searchQuery: searchQuery });
    return;
  };

  const [isClient, setIsClient] = React.useState(null);
  React.useEffect(() => setIsClient(true), []);

  return (
    <Container>
      <h1>Test Searchkit Querystrings</h1>
      {isClient && (
        <OverridableContext.Provider value={overriddenComponents}>
          <ReactSearchKit
            searchApi={ploneSearchApi(searchconfig)}
            eventListenerEnabled={true}
            initialQueryState={initialState}
            searchOnInit={false}
          >
            <Segment>
              {/* <Input
                id="my-field"
                title="some strings to search for"
                onChange={(event, data) => {
                  onchangehandler(event, data);
                }}
              /> */}
              <SearchBar
                placeholder="Suche"
                autofocus="false"
                uiProps={{
                  icon: 'search',
                  iconPosition: 'left',
                  className: 'searchbarinput',
                }}
                onChange={(event, data) => {
                  onchangehandler(event, data);
                }}
              />
              <Count />
              <OnResults />
            </Segment>
          </ReactSearchKit>
        </OverridableContext.Provider>
      )}
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
