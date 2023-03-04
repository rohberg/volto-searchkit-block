import React from 'react';
import { compact, truncate } from 'lodash';
import cx from 'classnames';
import Cookies from 'universal-cookie';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { Portal } from 'react-portal';
import { OverridableContext } from 'react-overridable';

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
  onQueryChanged,
  ReactSearchKit,
  ResultsLoader,
  withState,
  Error as ErrorCp,
} from 'react-searchkit';

import { expandToBackendURL } from '@plone/volto/helpers';
import { Icon } from '@plone/volto/components';
import leftAngle from '@plone/volto/icons/left-key.svg';
import rightAngle from '@plone/volto/icons/right-key.svg';
import firstAngle from '@plone/volto/icons/first.svg';
import lastAngle from '@plone/volto/icons/last.svg';

import messages from '../../messages';
import { flattenESUrlToPath, getObjectFromObjectList } from '../helpers';

import { PloneSearchApi } from '../Searchkit/ESSearchApi';
import { CustomESRequestSerializer } from '../Searchkit/CustomESRequestSerializer';
import { CustomESResponseSerializer } from '../Searchkit/CustomESResponseSerializer';
import { OnResults } from '../Searchkit/Results';
import SectionsSearch from '../Searchkit/SectionsSearch';
import SearchBarSection from '../Searchkit/SearchBarSection';

import { ElasticSearchHighlights } from '../Searchkit/ElasticSearchHighlights';
import ErrorComponent from '../Searchkit/Error';
// import StateLogger from '../StateLogger';

import './less/springisnow-volto-searchkit-block.less';

// TODO Make reviewstatemapping configurable
export const ploneSearchApi = (data) => {
  const cookies = new Cookies();
  const authToken = cookies.get('auth_token');
  return new PloneSearchApi({
    axios: {
      url: expandToBackendURL('/@kitsearch'),
      timeout: 5000,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    },
    es: {
      requestSerializer: CustomESRequestSerializer,
      responseSerializer: CustomESResponseSerializer,
    },
    searchedFields: data.searchedFields,
    facet_fields: data.facet_fields,
    allowed_content_types: data.allowed_content_types,
    allowed_review_states: data.allowed_review_states,
    search_sections: data.search_sections,
    backend_url: data.backend_url,
    frontend_url: data.frontend_url,
    elastic_search_api_url: data.elastic_search_api_url,
    elastic_search_api_index: data.elastic_search_api_index,
  });
};

const _ExtraInfo = (props) => {
  const { result } = props;

  const extrainfo_fields = getObjectFromObjectList(
    props.currentQueryState.data.extrainfo_fields,
  );
  const facet_fields = getObjectFromObjectList(
    props.currentQueryState.data.facet_fields,
  );
  let subjectsFieldname = props.currentQueryState.data?.subjectsFieldname; // "subjects";

  const querystringindexes = useSelector(
    (state) => state.query?.data?.querystringindexes,
  );

  const translate = (key, fieldname) => {
    let label = key;
    if (querystringindexes || querystringindexes[fieldname]) {
      label = querystringindexes[fieldname]?.values[key]?.title || key;
    }
    return label;
  };

  return (
    <Item.Extra className="metadata">
      {Object.keys(extrainfo_fields).map((extrainfo_key, idx) => {
        if (!result[extrainfo_key]) {
          return null;
        }
        const extrainfo_value = Array.isArray(result[extrainfo_key])
          ? result[extrainfo_key]
          : [result[extrainfo_key]];

        return Object.keys(facet_fields).includes(extrainfo_key) ? (
          <React.Fragment key={extrainfo_key}>
            <span className="label">{extrainfo_fields[extrainfo_key]}:</span>
            {extrainfo_value?.map((item, index) => {
              let tito = translate(item, extrainfo_key);
              let payloadOfFilter = {
                searchQuery: {
                  sortBy: 'bestmatch',
                  sortOrder: 'asc',
                  layout: 'list',
                  page: 1,
                  size: 10,
                  filters: [[`${extrainfo_key}_agg`, item]],
                },
              };
              return (
                <button
                  onClick={() => onQueryChanged(payloadOfFilter)}
                  key={tito}
                >
                  {tito}
                  {index < extrainfo_value.length - 1 ? ',' : null}
                </button>
              );
            })}
            {idx < Object.keys(extrainfo_fields).length - 1 && (
              <span className="metadataseparator">|</span>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment key={extrainfo_key}>
            <span className="label">{extrainfo_fields[extrainfo_key]}:</span>
            {extrainfo_value?.map((item, index) => {
              let tito = item.title || item.token || item;
              return (
                <span key={index}>
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

      {Array.isArray(result[subjectsFieldname]) &&
      result[subjectsFieldname]?.length > 0 ? (
        <div className="metadata-tags">
          <span className="label">
            <FormattedMessage id="Tags" defaultMessage="Tags" />:
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
              <button key={tito} onClick={() => onQueryChanged(payloadOfTag)}>
                {tito}
                {index < result[subjectsFieldname].length - 1 ? (
                  ','
                ) : (
                  <span></span>
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </Item.Extra>
  );
};

const ExtraInfo = withState(_ExtraInfo);

const CustomResultsListItem = (props) => {
  const { result, index } = props;
  const querystringindexes = useSelector(
    (state) => state.query?.data?.querystringindexes,
  );

  const translate = (key) => {
    let label = key;
    if (querystringindexes?.informationtype) {
      label = querystringindexes.informationtype.values[key].title;
    }
    return label;
  };

  return (
    <Item
      key={`item_${index}`}
      className={cx('searchkitresultitem', result.review_state)}
    >
      <Item.Content>
        {result.informationtype?.length ? (
          <Item.Meta>
            {result.informationtype?.map((item, index) => {
              let tito = translate(item);
              const payload = {
                searchQuery: {
                  sortBy: 'bestmatch',
                  sortOrder: 'asc',
                  layout: 'list',
                  page: 1,
                  size: 10,
                  filters: [['informationtype_agg', item]],
                },
              };
              return (
                <button key={item} onClick={() => onQueryChanged(payload)}>
                  {tito}
                  {index < result['informationtype'].length - 1 ? ', ' : null}
                </button>
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
        <ExtraInfo result={result} />
        <ElasticSearchHighlights
          highlight={result.highlight}
          indexResult={index}
        />
      </Item.Content>
    </Item>
  );
};

const MyCountElement = ({ totalResults }) => {
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
 * CustomBucketAggregationElement
 * One single Filter of Faceted Navigation
 * props.agg.field: field name
 */
const CustomBucketAggregationElement = (props) => {
  const { title, containerCmp, updateQueryFilters } = props;
  const fieldname = props.agg.field;
  const querystringindexes = useSelector(
    (state) => state.query?.data?.querystringindexes,
  );

  const translate = (bucks) => {
    if (querystringindexes[fieldname]) {
      bucks.forEach((element) => {
        element.label = querystringindexes[fieldname].values[element.key].title;
      });
    }
    return bucks;
  };

  // Get label from token
  let buckets = containerCmp.props.buckets;
  buckets = translate(buckets);
  let filter_labels_dict = Object.fromEntries(
    Array.from(buckets, (x) => [x.key, x.label]), // TODO Translate label
  );
  // List of labels of selected options
  let selectedFilters = containerCmp.props.selectedFilters
    .map((el) => el[1])
    .map((token) => filter_labels_dict[token]);
  selectedFilters = compact(selectedFilters);
  // List of all available options
  let all_filters = containerCmp.props.buckets.map((el) => {
    return [containerCmp.props.aggName, el.key];
  });

  const removeAggFilters = (event) => {
    if (containerCmp.props.selectedFilters.length) {
      updateQueryFilters(containerCmp.props.selectedFilters);
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const selectAllAggFilters = (event) => {
    // toggle! updateQueryFilters toggles filter selection
    if (containerCmp.props.selectedFilters.length) {
      updateQueryFilters(containerCmp.props.selectedFilters);
    }
    updateQueryFilters(all_filters);
    // event.preventDefault();
    // event.stopPropagation();
  };

  return containerCmp ? (
    <div className="bucketAE">
      <Dropdown
        fluid
        scrolling
        text={selectedFilters.length > 0 ? selectedFilters.join(', ') : title}
        className={
          selectedFilters.length ? 'fnfilter selected' : 'fnfilter unselected'
        }
      >
        <Dropdown.Menu>
          <Dropdown.Item>
            <Item
              onClick={(e) => selectAllAggFilters(e)}
              className="select_all"
            >
              <FormattedMessage id="Select all" defaultMessage="Select all" />
            </Item>
          </Dropdown.Item>
          {containerCmp}
        </Dropdown.Menu>
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
  ) : null;
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
const CustomBucketAggregationContainerElement = ({ valuesCmp }) => {
  let foo = valuesCmp;
  foo.sort(choicesSorter);
  return <>{foo}</>;
};

const CustomBucketAggregationValuesElement = (props) => {
  const {
    bucket,
    keyField,
    isSelected,
    onFilterClicked,
    childAggCmps,
    // updateQueryState,
    // currentQueryState,
  } = props;
  const label = bucket.label
    ? `${bucket.label} (${bucket.doc_count})`
    : `${keyField} (${bucket.doc_count})`;

  const onFilterClickedCustom = (filter, event) => {
    // TODO If  cmd-key down: select option, but do not trigger search
    onFilterClicked(filter);
  };

  return (
    <Dropdown.Item key={bucket.key}>
      <Item
        onClick={(event) => onFilterClickedCustom(bucket.key, event)}
        className={isSelected ? 'isSelected' : ''}
      >
        {label}
      </Item>
      {childAggCmps}
    </Dropdown.Item>
  );
};

const customEmpytResultsElement = (props) => {
  const { resetQuery } = props;
  return (
    <Segment>
      <Header icon>
        <FormattedMessage id="No results" defaultMessage="No results" />
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
}) => {
  const selected = currentSortBy.concat('-', currentSortOrder);
  return (
    <div className="sortby">
      <span className="sort-by">
        <FormattedMessage id="Sort By:" defaultMessage="Sort by:" />
      </span>{' '}
      <Button
        as={Link}
        to="#"
        onClick={(e) => onValueChange('bestmatch-asc')}
        name="bestmatch-asc"
        className={cx('button-sort', {
          'button-active': selected === 'bestmatch-asc',
        })}
      >
        <FormattedMessage id="Relevance" defaultMessage="Relevance" />
      </Button>
      <Button
        onClick={(e) => onValueChange('modified-desc')}
        name="modified-desc"
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

const defaultOverriddenComponents = {
  'ResultsList.item.elasticsearch': CustomResultsListItem,
  'Count.element': MyCountElement,
  'ActiveFilters.element': myActiveFiltersElement,
  'EmptyResults.element': customEmpytResultsElement,
  'Sort.element.volto': customSort,
  'Pagination.element': customPaginationElement,
  'Error.element': ErrorComponent,
};

const dropdownOverriddenComponents = {
  'BucketAggregation.element': CustomBucketAggregationElement,
  'BucketAggregationContainer.element': CustomBucketAggregationContainerElement,
  'BucketAggregationValues.element': withState(
    CustomBucketAggregationValuesElement,
  ),
};

/**
 * FacetedSearch
 * @param {string} filterLayout default 'dropdown'
 * @param {object} overriddenComponents Override with custom components, ignore to stay with default 'dropdown' or step back to react-searchkit default components with value {}
 * @returns
 */
const FacetedSearch = ({ data, overriddenComponents }) => {
  const {
    facet_fields,
    allow_search_excluded_sections,
    show_filter_for_excluded_sections,
    relocation,
    filterLayout,
    search_sections,
  } = data;

  const querystringindexes = useSelector((state) => state.querystring?.indexes);

  let facet_fields_object = getObjectFromObjectList(facet_fields);
  if ('Subject' in facet_fields_object) {
    facet_fields_object.subjects = facet_fields_object.Subject;
    delete facet_fields_object.Subject;
  }

  overriddenComponents = overriddenComponents ?? {
    ...defaultOverriddenComponents,
    ...(filterLayout === 'dropdown' && dropdownOverriddenComponents),
  };

  // TODO Check if check on client could be made simpler
  const [isClient, setIsClient] = React.useState(null);
  React.useEffect(() => setIsClient(true), []);

  return (
    <Segment vertical>
      {isClient && (
        <OverridableContext.Provider value={overriddenComponents}>
          <ReactSearchKit
            searchApi={ploneSearchApi(data)}
            eventListenerEnabled={true}
            initialQueryState={{
              ...initialState,
              data: { ...data, querystringindexes: querystringindexes },
            }}
            urlHandlerApi={{ enabled: true }}
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
                  <SearchBarSection />
                </Portal>
              ) : (
                <Grid relaxed style={{ padding: '1em 0' }}>
                  <Grid.Row>
                    <Grid.Column width={12}>
                      <SearchBarSection />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              )}

              <Grid relaxed style={{ padding: '1em 0' }}>
                <Grid.Row className={'facetedsearch_sections ' + filterLayout}>
                  <Grid.Column width={12}>
                    <SectionsSearch
                      search_sections={search_sections}
                      allow_search_excluded_sections={
                        allow_search_excluded_sections
                      }
                      show_filter_for_excluded_sections={
                        show_filter_for_excluded_sections
                      }
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row className={'facetedsearch_filter ' + filterLayout}>
                  <Grid.Column width={12}>
                    <div className="bucketaggregations">
                      {Object.keys(facet_fields_object)?.map((facet) => (
                        <BucketAggregation
                          key={facet}
                          title={facet_fields_object[facet]}
                          agg={{
                            field: facet,
                            aggName: `${facet}_agg`,
                          }}
                        />
                      ))}
                    </div>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={12}>
                    <ResultsLoader>
                      <ErrorCp />
                      <EmptyResults />
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
