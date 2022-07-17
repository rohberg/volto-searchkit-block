import React from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';
import { Link, useLocation } from 'react-router-dom';
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
import { flattenESUrlToPath } from '../helpers';
import { ploneSearchApi } from './FacetedSearch';
import { ElasticSearchMatches, getMatches } from './ElasticSearchHighlights';

const sort_caseinsensitive = (a, b) => {
  var nameA = a.toUpperCase(); // Groß-/Kleinschreibung ignorieren
  var nameB = b.toUpperCase(); // Groß-/Kleinschreibung ignorieren
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

const _OnHighlights = (props) => {
  let location = useLocation();
  let highlights = props.currentResultsState;
  let hits = highlights.data.hits;

  const regex = /<em>(.*?)<\/em>/gm;
  let fragments = [];
  hits.map((hit) => {
    hit.highlight = hit.highlight || [];
    Object.keys(hit.highlight).forEach((fld) => {
      hit.highlight[fld].forEach((highlightfragment) => {
        fragments.push(highlightfragment);
      });
    });
    return null;
  });
  let matches = new Set();
  fragments.forEach((txt) => {
    let result = [...txt.matchAll(regex)];
    result.map((match) => {
      matches.add(match[1]);
    });
  });
  let matches_sorted = Array.from(matches);
  matches_sorted.sort(sort_caseinsensitive);
  return (
    <div>
      <Header as="h2">Found {matches_sorted.length} matches.</Header>
      {matches_sorted.map((match) => (
        <div key={match}>
          <a
            href={`${location.pathname}?q=${match}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {match}
          </a>
        </div>
      ))}
    </div>
  );
};
const OnHighlights = withState(_OnHighlights);

const OnResults = withState(ResultsMultiLayout);

const CustomResultsListItem = ({ result, index }) => {
  console.debug('** result.title', result.title);
  return (
    <div>
      <Header as="h3">
        <Link to={flattenESUrlToPath(result['@id'])} target="_blank">
          {result.title}
        </Link>
      </Header>
      <ElasticSearchMatches highlight={result.highlight} indexResult={index} />
    </div>
  );
};

const DocumentsCount = ({ totalResults }) => {
  return <Header as="h2">Found {totalResults} documents.</Header>;
};

const overriddenComponents = {
  'ResultsList.item': CustomResultsListItem,
  'Count.element': DocumentsCount,
};

const TestSearchkitQuerystrings = (props) => {
  const searchconfig = {
    elastic_search_api_url: 'http://localhost:9200',
    elastic_search_api_index: 'plone2020',
    // reviewstatemapping: {
    //   Manual: ['internally_published', 'private', 'internal'],
    // },
    simpleFields: [
      'title^1.4',
      'description^1.2',
      'subjects^1.4',
      'freemanualtags_searchable^1.4',
      'blocks_plaintext',
      'manualfilecontent',
    ],
    backend_url: 'http://localhost:8080/Plone',
    frontend_url: 'http://igib.example.com',
  };

  const initialState = {
    sortBy: 'bestmatch',
    sortOrder: 'asc',
    // sortBy: 'modified',
    // sortOrder: 'desc',
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
      <Segment>
        <Header as="h1" className="documentFirstHeading">
          Matches
        </Header>
      </Segment>
      {isClient && (
        <OverridableContext.Provider value={overriddenComponents}>
          <ReactSearchKit
            searchApi={ploneSearchApi(searchconfig)}
            eventListenerEnabled={true}
            initialQueryState={initialState}
            searchOnInit={true}
          >
            <>
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
              </Segment>
              <Segment>
                <Count />
                <OnHighlights />
                <Header as="h2">Documents with title and matches</Header>
                <OnResults />
              </Segment>
            </>
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
