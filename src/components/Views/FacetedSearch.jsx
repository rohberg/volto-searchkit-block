import React from 'react';
import { useSelector } from 'react-redux';

import { OverridableContext } from 'react-overridable';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { compact, truncate } from 'lodash';
import cx from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import { Portal } from 'react-portal';
import messages from '../../messages';

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
} from 'react-searchkit';

import { expandToBackendURL } from '@plone/volto/helpers';
import { Icon } from '@plone/volto/components';
import leftAngle from '@plone/volto/icons/left-key.svg';
import rightAngle from '@plone/volto/icons/right-key.svg';
import firstAngle from '@plone/volto/icons/first.svg';
import lastAngle from '@plone/volto/icons/last.svg';

import { PloneSearchApi } from '../Searchkit/ESSearchApi';
import { CustomESRequestSerializer } from '../Searchkit/CustomESRequestSerializer';
import { CustomESResponseSerializer } from '../Searchkit/CustomESResponseSerializer';
import { Results } from '../Searchkit/Results';

import { flattenESUrlToPath, getObjectFromObjectList, scrollToTarget } from '../helpers';
import { ElasticSearchHighlights } from './ElasticSearchHighlights';
import StateLogger from '../StateLogger';

import './less/springisnow-volto-searchkit-block.less';


// TODO Make reviewstatemapping configurable
export const ploneSearchApi = (data) => {
  return new PloneSearchApi({
    axios: {
      url: expandToBackendURL('/@kitsearch'),
      timeout: 5000,
      headers: { Accept: 'application/json' },
    },
    es: {
      requestSerializer: CustomESRequestSerializer,
      responseSerializer: CustomESResponseSerializer,
    },
    searchedFields: data.searchedFields,
    facet_fields: data.facet_fields,
    allowed_content_types: data.allowed_content_types,
    allowed_review_states: data.allowed_review_states,
    backend_url: data.backend_url,
    frontend_url: data.frontend_url,
    elastic_search_api_url: data.elastic_search_api_url,
    elastic_search_api_index: data.elastic_search_api_index,
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


class _ExtraInfo extends React.Component {
  render() {
    const {result} = this.props;
    const extrainfo_fields = getObjectFromObjectList(this.props.currentQueryState.data.extrainfo_fields);
    const facet_fields = getObjectFromObjectList(this.props.currentQueryState.data.facet_fields);
    let subjectsFieldname = this.props.currentQueryState.data.subjectsFieldname;  // "subjects";
    return (
      <Item.Extra>
        {Object.keys(extrainfo_fields).map((extrainfo_key, idx) => {
          if (! result[extrainfo_key]) {
            console.debug("not indexed:", extrainfo_key)
            return
          }
          const extrainfo_value = Array.isArray(result[extrainfo_key]) ? result[extrainfo_key] : [result[extrainfo_key]];

          return Object.keys(facet_fields).includes(extrainfo_key) ? (
            <React.Fragment key={extrainfo_key}>
              <span className='label'>{extrainfo_fields[extrainfo_key]}:</span>
              {extrainfo_value?.map((item, index) => {
                let tito = item.title || item.token;
                let payloadOfFilter = {
                  searchQuery: {
                    sortBy: 'bestmatch',
                    sortOrder: 'asc',
                    layout: 'list',
                    page: 1,
                    size: 10,
                    filters: [[`${extrainfo_key}_agg.inner.${extrainfo_key}_token`, item.token]],
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
                    {index < extrainfo_value.length - 1 ? ',' : null}
                  </Button>
                );
              })}
              {idx < Object.keys(extrainfo_fields).length - 1 && (
                <span className="metadataseparator">|</span>
              )}
            </React.Fragment>
          ) : (
            
            <React.Fragment key={extrainfo_key}>
              <span className='label'>{extrainfo_fields[extrainfo_key]}:</span>
              {extrainfo_value?.map((item, index) => {
                let tito = item.title || item.token || item;
                return (
                  <span>
                    {tito}
                    {index < extrainfo_value.length - 1 ? ',' : null}
                  </span>
                );
              })}
              {idx < Object.keys(extrainfo_fields).length - 1 && (
                <span className="metadataseparator">|</span>
              )}
            </React.Fragment>
          );
        })}

        {result[subjectsFieldname]?.length > 0 ? (
          <div className="metadata-tags">
            <span className='label'>
              <FormattedMessage
                id="Tags"
                defaultMessage="Tags"
              />:
            </span>
            {result[subjectsFieldname]?.map((item, index) => {
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
                  {index < result[subjectsFieldname].length - 1 ? (
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
    )
  }
}

const ExtraInfo = withState(_ExtraInfo);

const CustomResultsListItem = (props) => {
  const { result, index } = props;
  // TODO add class per filter option (result.informationsource.token)
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
        <ExtraInfo
          result={result}
        />
        <ElasticSearchHighlights
          highlight={result.highlight}
          indexResult={index}
        />
      </Item.Content>
    </Item>
  );
};

const myCountElement = ({ totalResults }) => {
  const intl = useIntl();
  let labelSearchResults = intl.formatMessage(messages.searchresult);
  let labelSearchResultsPlural = intl.formatMessage(messages.searchresults);
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
        <IconSemantic
          className={
            selectedFilters.length
              ? 'deleteFilter selected'
              : 'deleteFilter unselected'
          }
          name="delete"
          onClick={(e) => removeAggFilters(e)}
        />
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
    <Segment>
      <Header icon>
        <FormattedMessage
                id="No results"
                defaultMessage="No results"
              />
      </Header>
      <Button        
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
        <FormattedMessage id="Date" defaultMessage="Date" />
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

  return pages > 1 ? (
    <Paginator
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
  ) : null;
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
}) => {
  const { facet_fields, relocation, filterLayout } = data;
  const facet_fields_object = getObjectFromObjectList(facet_fields);
  const token = useSelector((state) => state.userSession?.token);
  const intl = useIntl();

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
            initialQueryState={{...initialState, data: data}}
          >
            <Container>
              {typeof document !== 'undefined' && relocation?.length > 0 ? (
                <Portal
                  node={
                    true &&
                    document.querySelectorAll(relocation) &&
                    document.querySelectorAll(relocation)[0]
                  }
                >
                  <div className="searchbar-wrapper">
                    <SearchBar
                      placeholder={intl.formatMessage(messages.search)}
                      autofocus="false"
                      uiProps={{
                        icon: 'search',
                        iconPosition: 'left',
                        className: 'searchbarinput',
                      }}
                      actionProps={{
                        content: intl.formatMessage(messages.search)
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
                          placeholder={intl.formatMessage(messages.search)}
                          autofocus="false"
                          uiProps={{
                            icon: 'search',
                            iconPosition: 'left',
                          }}
                          actionProps={{
                            content: intl.formatMessage(messages.search)
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
                    {Object.keys(facet_fields_object)?.map((facet) => (
                        <BucketAggregation
                          title={facet_fields_object[facet]}
                          agg={{
                            field: facet,
                            aggName:
                            `${facet}_agg.inner.${facet}_token`,
                          }}
                        />
                    ))}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={12}>
                    <ResultsLoader>
                      <EmptyResults />
                      <Error />
                      <OnResults sortValues={sortValues} />
                    </ResultsLoader>
                    {/* <StateLogger /> */}
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
