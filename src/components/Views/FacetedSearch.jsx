// TODO update counts of BucketAggregation on selection of filter
// TODO lacales actionProps, placeholder
import React from 'react';
import { useSelector } from 'react-redux';

import { OverridableContext } from 'react-overridable';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { compact, truncate } from 'lodash';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Portal } from 'react-portal';

import {
  Button,
  Container,
  Dropdown,
  Grid,
  Header,
  Icon as IconSemantic,
  Item,
  Label,
  Pagination as Paginator,
  Segment,
} from 'semantic-ui-react';
import {
  BucketAggregation,
  EmptyResults,
  Error,
  onQueryChanged,
  ReactSearchKit,
  ResultsLoader,
  SearchBar,
  withState,
  // updateQueryString,
} from 'react-searchkit';

import { Icon } from '@plone/volto/components';
import leftAngle from '@plone/volto/icons/left-key.svg';
import rightAngle from '@plone/volto/icons/right-key.svg';
import firstAngle from '@plone/volto/icons/first.svg';
import lastAngle from '@plone/volto/icons/last.svg';

import { PloneSearchApi } from '../Searchkit/ESSearchApi';
import { CustomESRequestSerializer } from '../Searchkit/CustomESRequestSerializer';
import { CustomESResponseSerializer } from '../Searchkit/CustomESResponseSerializer';
import { Results } from '../Searchkit/Results';

import { flattenESUrlToPath, scrollToTarget } from '../helpers';
import { ElasticSearchHighlights } from './ElasticSearchHighlights';

import './less/springisnow-volto-searchkit-block.less';

import config from '@plone/volto/registry';

// TODO Make reviewstatemapping configurable
export const ploneSearchApi = (data) => {
  const search_url = data.elastic_search_api_url || 'http://localhost:9200';
  const search_index = data.elastic_search_api_index || 'esploneindex';
  return new PloneSearchApi({
    axios: {
      // url: 'http://localhost:9200/esploneindex/_search',
      url: search_url + '/' + search_index + '/_search',
      timeout: 5000,
      headers: { Accept: 'application/json' },
    },
    es: {
      requestSerializer: CustomESRequestSerializer,
      responseSerializer: CustomESResponseSerializer,
    },
    simpleFields: data.simpleFields,
    nestedFilterFields: data.nestedFilterFields,
    allowed_content_types: data.allowed_content_types,
    allowed_review_states: data.allowed_review_states,
    backend_url: data.backend_url,
    frontend_url: data.frontend_url,
  });
};

const MyResults = (props) => {
  // Add scroll to input field search
  React.useEffect(() => {
    const el = document.querySelector('.navigation-dropdownmenu');
    if (el) {
      scrollToTarget(el);
    }
  }, []);

  return <Results {...props} />;
};

const OnResults = withState(MyResults);

// class Tags extends Component {
//   onClick = (event, value) => {
//     window.history.push({
//       search: `${window.location.search}&f=tags_agg:${value}`,
//     });
//     event.preventDefault();
//   };

//   render() {
//     if (!this.props.tags) return null;
//     return this.props.tags?.map((tag, index) => (
//       <Button
//         key={index}
//         size="mini"
//         onClick={(event) => this.onClick(event, tag)}
//       >
//         {tag}
//       </Button>
//     ));
//   }
// }

const CustomResultsListItem = ({ result, index }) => {
  // TODO make filter configurable
  let flts = {
    kompasscomponent: {
      label: 'Komponente',
      bucket: 'kompasscomponent_agg.inner.kompasscomponent_token',
    },
    targetaudience: {
      label: 'Zielgruppe',
      bucket: 'targetaudience_agg.inner.targetaudience_token',
    },
    organisationunit: {
      label: 'Organistionseinheit',
      bucket: 'organisationunit_agg.inner.organisationunit_token',
    },
  };
  let filterkeys = Object.keys(flts).filter((el) => result[el]?.length > 0);
  return (
    <Item
      key={`item_${index}`}
      className={cx('searchkitresultitem', result.review_state)}
    >
      <Item.Content>
        {result.informationtype?.length ? (
          <Item.Meta>
            {result.informationtype?.map((item, index) => {
              let tito = item.title || item.token;
              const payload = {
                searchQuery: {
                  sortBy: 'bestmatch',
                  sortOrder: 'asc',
                  layout: 'list',
                  page: 1,
                  size: 10,
                  filters: [
                    [
                      'informationtype_agg.inner.informationtype_token',
                      item.token,
                    ],
                  ],
                },
              };
              return (
                <Button
                  key={tito}
                  as={Link}
                  to="#"
                  onClick={() => onQueryChanged(payload)}
                >
                  {tito}
                  {index < result['informationtype'].length - 1 ? ', ' : null}
                </Button>
              );
            })}
          </Item.Meta>
        ) : null}
        <Item.Header as={Link} to={flattenESUrlToPath(result['@id'])}>
          {result.title}
          {/* <p>result['@id']: {result['@id']}</p>
          <p>
            flattenESUrlToPath(result['@id']):{' '}
            {flattenESUrlToPath(result['@id'])}
          </p> */}
        </Item.Header>
        <Item.Description>
          <Link to={flattenESUrlToPath(result['@id'])}>
            {truncate(result.description, { length: 200 })}
          </Link>
        </Item.Description>
        <Item.Extra className="metadata">
          {filterkeys.map((flt, fltindex) => {
            // return result[flt]?.length ? (
            return true ? (
              <React.Fragment key={flts[flt].label}>
                <span>{flts[flt].label}: </span>
                {result[flt]?.map((item, index) => {
                  let tito = item.title || item.token;
                  let payloadOfFilter = {
                    searchQuery: {
                      sortBy: 'bestmatch',
                      sortOrder: 'asc',
                      layout: 'list',
                      page: 1,
                      size: 10,
                      filters: [[flts[flt].bucket, item.token]],
                    },
                  };
                  return (
                    <Button
                      as={Link}
                      to="#"
                      onClick={() => onQueryChanged(payloadOfFilter)}
                      key={tito}
                    >
                      {tito}
                      {index < result[flt].length - 1 ? ',' : null}
                    </Button>
                  );
                })}
                {fltindex < filterkeys.length - 1 && (
                  <span className="metadataseparator">|</span>
                )}
              </React.Fragment>
            ) : null;
          })}
          {result.freemanualtags?.length ? (
            <div className="freemanualtags">
              <span>Tags: </span>
              {result.freemanualtags?.map((item, index) => {
                let tito = item;
                let payloadOfTag = {
                  searchQuery: {
                    sortBy: 'bestmatch',
                    sortOrder: 'asc',
                    layout: 'list',
                    page: 1,
                    size: 10,
                    queryString: tito,
                  },
                };
                return (
                  <Button
                    key={tito}
                    as={Link}
                    to="#"
                    onClick={() => onQueryChanged(payloadOfTag)}
                  >
                    {tito}
                    {index < result.freemanualtags.length - 1 ? (
                      ','
                    ) : (
                      <span></span>
                    )}
                  </Button>
                );
              })}
            </div>
          ) : null}
        </Item.Extra>

        <ElasticSearchHighlights
          highlight={result.highlight}
          indexResult={index}
        />
      </Item.Content>
    </Item>
  );
};

const myCountElement = ({ totalResults }) => {
  // TODO translation search result label
  let labelSearchResults = 'Suchergebnis';
  let labelSearchResultsPlural = 'Suchergebnisse';
  return (
    <div className="countlabel">
      {totalResults}{' '}
      {totalResults === 1 ? labelSearchResults : labelSearchResultsPlural}
    </div>
  );
};

const myActiveFiltersElement = (props) => {
  const { filters, removeActiveFilter, getLabel } = props;
  return (
    <>
      {filters.map((filter, index) => {
        const { label, activeFilter } = getLabel(filter);
        return (
          <Label
            image
            key={index}
            onClick={() => removeActiveFilter(activeFilter)}
          >
            {label}
            <IconSemantic name="delete" />
          </Label>
        );
      })}
    </>
  );
};

/**
 * customBucketAggregationElement
 * One single Filter of Faceted Navigation
 */
const customBucketAggregationElement = (props) => {
  const { title, containerCmp, updateQueryFilters } = props;
  // Get label from token
  let buckets = containerCmp.props.buckets;
  let allFilters = Object.fromEntries(
    Array.from(buckets, (x) => [x.key, x.label]),
  );
  let selectedFilters = containerCmp.props.selectedFilters
    .map((el) => el[1])
    .map((token) => allFilters[token]);
  selectedFilters = compact(selectedFilters);

  const removeAggFilters = (event) => {
    if (containerCmp.props.selectedFilters.length) {
      updateQueryFilters(containerCmp.props.selectedFilters);
    }
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    containerCmp && (
      <div className="bucketAE">
        <Dropdown
          fluid
          scrolling
          text={selectedFilters.length > 0 ? selectedFilters.join(', ') : title}
          className={
            selectedFilters.length ? 'fnfilter selected' : 'fnfilter unselected'
          }
        >
          <Dropdown.Menu>{containerCmp}</Dropdown.Menu>
        </Dropdown>
        {true && (
          <IconSemantic
            className={
              selectedFilters.length
                ? 'deleteFilter selected'
                : 'deleteFilter unselected'
            }
            name="delete"
            onClick={(e) => removeAggFilters(e)}
          />
        )}
      </div>
    )
  );
};

function choicesSorter(a, b) {
  const titleA = a.props.bucket.label;
  const titleB = b.props.bucket.label;
  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  }
  return 0;
}
const customBucketAggregationContainerElement = ({ valuesCmp }) => {
  let foo = valuesCmp;
  foo.sort(choicesSorter);
  return <>{foo}</>;
};

const customBucketAggregationValuesElement = (props) => {
  const {
    bucket,
    isSelected,
    onFilterClicked,
    getChildAggCmps,
    keyField,
  } = props;
  const label = bucket.label
    ? `${bucket.label} (${bucket.doc_count})`
    : `${keyField} (${bucket.doc_count})`;
  const childAggCmps = getChildAggCmps(bucket);
  return (
    <Dropdown.Item key={bucket.key}>
      <Item
        onClick={() => onFilterClicked(bucket.key)}
        className={isSelected ? 'isSelected' : ''}
      >
        {label}
      </Item>
      {childAggCmps}
    </Dropdown.Item>
  );
};

const customEmpytResultsElement = (props) => {
  const { queryString, resetQuery } = props;
  return (
    <Segment placeholder textAlign="center">
      <Header icon>
        <IconSemantic name="search" />
        Keine Resultate gefunden.
      </Header>
      <Button
        primary
        onClick={() => {
          resetQuery();
        }}
      >
        Suche zurücksetzen
      </Button>
    </Segment>
  );
};

const customSort = ({
  currentSortBy,
  currentSortOrder,
  options,
  onValueChange,
  computeValue,
}) => {
  const selected = computeValue(currentSortBy, currentSortOrder);
  // const _options = options.map((element, index) => {
  //   return {
  //     key: index,
  //     text: element.text,
  //     value: element.value,
  //   };
  // });
  return (
    <div className="header-content">
      <span className="sort-by">
        <FormattedMessage id="Sort By:" defaultMessage="Sort by:" />
      </span>{' '}
      <Button
        onClick={(e) => onValueChange('bestmatch-asc')}
        name="bestmatch-asc"
        size="tiny"
        className={cx('button-sort', {
          'button-active': selected === 'bestmatch-asc',
        })}
      >
        <FormattedMessage id="Relevance" defaultMessage="Relevance" />
      </Button>
      <Button
        onClick={(e) => onValueChange('modified-desc')}
        name="modified-desc"
        size="tiny"
        className={cx('button-sort', {
          'button-active': selected === 'modified-desc',
        })}
      >
        Datum
      </Button>
    </div>
  );
};

const customPaginationElement = (props) => {
  const {
    currentPage,
    currentSize,
    totalResults,
    onPageChange,
    options,
    ...extraParams
  } = props;
  const pages = Math.ceil(totalResults / currentSize);
  const boundaryRangeCount = options.boundaryRangeCount;
  const siblingRangeCount = options.siblingRangeCount;
  const showEllipsis = options.showEllipsis;
  const showFirst = options.showFirst;
  const showLast = options.showLast;
  const showPrev = options.showPrev;
  const showNext = options.showNext;
  const size = options.size || 'massive';
  const _onPageChange = (event, { activePage }) => {
    onPageChange(activePage);
  };

  return (
    <Paginator
      city="Basel"
      activePage={currentPage}
      totalPages={pages}
      onPageChange={_onPageChange}
      boundaryRange={boundaryRangeCount}
      siblingRange={siblingRangeCount}
      ellipsisItem={
        showEllipsis
          ? {
              content: <IconSemantic name="ellipsis horizontal" />,
              icon: true,
            }
          : null
      }
      firstItem={
        showFirst
          ? {
              content: <Icon name={firstAngle} size="20px" />,
              icon: true,
            }
          : null
      }
      lastItem={
        showLast
          ? {
              content: <Icon name={lastAngle} size="20px" />,
              icon: true,
            }
          : null
      }
      prevItem={
        showPrev
          ? {
              content: <Icon name={leftAngle} size="20px" />,
              icon: true,
            }
          : null
      }
      nextItem={
        showNext
          ? {
              content: <Icon name={rightAngle} size="20px" />,
              icon: true,
            }
          : null
      }
      size={size}
    />
  );
};

const defaultOverriddenComponents = {
  'ResultsList.item.elasticsearch': CustomResultsListItem,
  'Count.element': myCountElement,
  'ActiveFilters.element': myActiveFiltersElement,
  'EmptyResults.element': customEmpytResultsElement,
  'Sort.element.volto': customSort,
  'Pagination.element': customPaginationElement,
};

const dropdownOverriddenComponents = {
  'BucketAggregation.element': customBucketAggregationElement,
  'BucketAggregationContainer.element': customBucketAggregationContainerElement,
  'BucketAggregationValues.element': customBucketAggregationValuesElement,
};

const sortValues = [
  {
    text: 'Relevanz',
    sortBy: 'bestmatch',
    sortOrder: 'asc',
  },
  {
    text: 'Neueste',
    sortBy: 'modified',
    sortOrder: 'desc',
  },
  // {
  //   text: 'Alphabetisch',
  //   sortBy: 'sortable_title.keyword',
  //   sortOrder: 'asc',
  // },
];

const initialState = {
  sortBy: 'bestmatch',
  sortOrder: 'asc',
  // sortBy: 'modified',
  // sortOrder: 'desc',
  queryString: '',
  layout: 'list',
  page: 1,
  size: 10,
};

/**
 * FacetedSearch
 * @param {string} filterLayout default 'dropdown'
 * @param {object} overriddenComponents Override with custom components, ignore to stay with default 'dropdown' or step back to react-searchkit default components with value {}
 * @returns
 */
const FacetedSearch = ({
  data,
  overriddenComponents,
  filterLayout = config.settings.searchkitblock.filterLayout,
}) => {
  const { relocation = data.relocation || '' } = data;

  const token = useSelector((state) => state.userSession?.token);

  overriddenComponents = overriddenComponents ?? {
    ...defaultOverriddenComponents,
    ...(filterLayout === 'dropdown' && dropdownOverriddenComponents),
  };

  const [isClient, setIsClient] = React.useState(null);
  React.useEffect(() => setIsClient(true), []);
  let location = useLocation();

  const payloadOfReset = {
    searchQuery: {
      sortBy: 'bestmatch',
      sortOrder: 'asc',
      layout: 'list',
      page: 1,
      size: 10,
      queryString: '',
    },
  };

  const onResetHandler = (event) => {
    onQueryChanged(payloadOfReset);
  };

  return (
    <Segment vertical>
      {isClient && (
        <OverridableContext.Provider value={overriddenComponents}>
          <ReactSearchKit
            searchApi={ploneSearchApi(data)}
            eventListenerEnabled={true}
            initialQueryState={initialState}
          >
            <Container>
              {typeof document !== 'undefined' && relocation.length > 0 ? (
                <Portal
                  node={
                    true &&
                    document.querySelectorAll(relocation) &&
                    document.querySelectorAll(relocation)[0]
                  }
                >
                  <div className="searchbar-wrapper">
                    <SearchBar
                      placeholder="Suche"
                      autofocus="false"
                      uiProps={{
                        icon: 'search',
                        iconPosition: 'left',
                        className: 'searchbarinput',
                      }}
                    />
                    <IconSemantic
                      name="delete"
                      onClick={(event) => onResetHandler(event)}
                    />
                  </div>
                </Portal>
              ) : (
                <Grid relaxed style={{ padding: '2em 0' }}>
                  <Grid.Row>
                    <Grid.Column width={12}>
                      <div className="searchbar-wrapper">
                        <SearchBar
                          placeholder="Suche"
                          autofocus="false"
                          uiProps={{
                            icon: 'search',
                            iconPosition: 'left',
                          }}
                        />
                        <IconSemantic
                          basic="true"
                          icon="true"
                          name="delete"
                          onClick={(event) => onResetHandler(event)}
                        />
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              )}

              <Grid relaxed style={{ padding: '2em 0' }}>
                <Grid.Row>
                  <Grid.Column
                    width={12}
                    className={'facetedsearch_filter ' + filterLayout}
                  >
                    <BucketAggregation
                      title="Informationtype"
                      agg={{
                        field: 'informationtype',
                        aggName:
                          'informationtype_agg.inner.informationtype_token',
                      }}
                    />
                    {/* <BucketAggregation
                      title="Komponenten"
                      agg={{
                        field: 'kompasscomponent',
                        aggName:
                          'kompasscomponent_agg.inner.kompasscomponent_token',
                      }}
                    /> */}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={12}>
                    <ResultsLoader>
                      <EmptyResults />
                      <Error />
                      <OnResults sortValues={sortValues} />
                    </ResultsLoader>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Container>
          </ReactSearchKit>
        </OverridableContext.Provider>
      )}
    </Segment>
  );
};

export default FacetedSearch;
