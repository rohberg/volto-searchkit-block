import React from 'react';
import { useIntl } from 'react-intl';
import { createPortal } from 'react-dom';
import { Container, Header, Segment } from 'semantic-ui-react';
import { useHistory } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { OverridableContext } from 'react-overridable';
import { Icon, Toolbar } from '@plone/volto/components';
import { getParentUrl } from '@plone/volto/helpers';
import backSVG from '@plone/volto/icons/back.svg';

import {
  onQueryChanged,
  ReactSearchKit,
  SearchBar,
  withState,
  ResultsMultiLayout,
  Count,
} from 'react-searchkit';
import { flattenESUrlToPath } from '../helpers';
import { ploneSearchApi } from './FacetedSearch';
import { ElasticSearchMatches } from '../Searchkit/ElasticSearchHighlights';
import messages from '../../messages';

import config from '@plone/volto/registry';

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
    result.forEach((match) => {
      matches.add(match[1]);
    });
  });
  let matches_sorted = Array.from(matches);
  matches_sorted.sort(sort_caseinsensitive);
  return (
    <div>
      <Header as="h2">{matches_sorted.length} matches found:</Header>
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
  return (
    <div>
      <Header as="h3">
        <a
          href={flattenESUrlToPath(result['@id'])}
          target="_blank"
          rel="noreferrer"
        >
          {result.title}
        </a>
      </Header>
      <ElasticSearchMatches highlight={result.highlight} indexResult={index} />
    </div>
  );
};

const DocumentsCount = ({ totalResults }) => {
  return <Header as="h2">{totalResults} documents found:</Header>;
};

const overriddenComponents = {
  'ResultsList.item': CustomResultsListItem,
  'Count.element': DocumentsCount,
};

const TestSearchkitQuerystrings = (props) => {
  const intl = useIntl();
  const history = useHistory();
  const searchconfig = config.blocks.blocksConfig.searchkitblock.searchconfig;

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

  const locale = useSelector((state) => state.intl.locale);
  const [isClient, setIsClient] = React.useState(null);
  React.useEffect(() => setIsClient(true), []);

  return (
    <React.Fragment>
      <Container>
        <Segment>
          <Header as="h1" className="documentFirstHeading">
            Matches
          </Header>
        </Segment>
        {isClient && (
          <OverridableContext.Provider value={overriddenComponents}>
            <ReactSearchKit
              searchApi={ploneSearchApi(searchconfig, locale)}
              eventListenerEnabled={true}
              initialQueryState={{
                ...initialState,
                locale: locale,
              }}
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
                    placeholder={intl.formatMessage(messages.search)}
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
                  <OnHighlights />
                  <Count />
                  <OnResults />
                </Segment>
              </>
            </ReactSearchKit>
          </OverridableContext.Provider>
        )}
      </Container>

      {isClient &&
        createPortal(
          <Toolbar
            pathname={location.pathname}
            hideDefaultViewButtons
            inner={
              <Link
                className="item"
                to="#"
                onClick={() => {
                  history.push(getParentUrl(location.pathname));
                }}
              >
                <Icon
                  name={backSVG}
                  className="contents circled"
                  size="30px"
                  title={intl.formatMessage(messages.cancel)}
                />
              </Link>
            }
          />,
          document.getElementById('toolbar'),
        )}
    </React.Fragment>
  );
};

export default TestSearchkitQuerystrings;
