// TODO update counts of BucketAggregation on selection of filter
// TODO lacales actionProps, placeholder
import React from 'react';

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
  Icon,
  Item,
  Label,
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

import { ESSearchApi } from '../Searchkit/ESSearchApi';
import { CustomESRequestSerializer } from '../Searchkit/CustomESRequestSerializer';
import { CustomESResponseSerializer } from '../Searchkit/CustomESResponseSerializer';
import { Results } from '../Searchkit/Results';

import { useDispatch } from 'react-redux';
import { flattenESUrlToPath } from '../helpers';

import './less/springisnow-volto-searchkit-block.less';

import config from '@plone/volto/registry';

const OnResults = withState(Results);

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
  // TODO make this configurable
  let flts = {
    kompasscomponent: {
      label: 'Komponente',
      bucket: 'kompasscomponent_agg.kompasscomponent_token',
    },
    targetaudience: {
      label: 'Zielgruppe',
      bucket: 'targetaudience_agg.targetaudience_token',
    },
    organisationunit: {
      label: 'Organistionseinheit',
      bucket: 'organisationunit_agg.organisationunit_token',
    },
  };
  let filterkeys = Object.keys(flts).filter((el) => result[el]?.length > 0);
  return (
    <Item
      key={index}
      className={cx('searchkitresultitem', result.review_state)}
    >
      <Item.Content>
        {result.informationtype?.length ? (
          <Item.Meta>
            <span>
              {result.informationtype.map((el) => el.title).join(', ')}
            </span>
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
              <>
                <span key={flts[flt].label}>{flts[flt].label}: </span>
                {result[flt]?.map((item, index) => {
                  let tito = item.title || item.token;
                  let payloadOfTag = {
                    searchQuery: {
                      sortBy: 'bestmatch',
                      sortOrder: 'asc',
                      layout: 'list',
                      page: 1,
                      size: 10,
                      filters: [[flts[flt].bucket, tito]],
                    },
                  };
                  return (
                    <Button
                      as={Link}
                      onClick={() => onQueryChanged(payloadOfTag)}
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
              </>
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
            <Icon name="delete" />
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
          text={selectedFilters.length > 0 ? selectedFilters.join(', ') : title}
          className={
            selectedFilters.length ? 'fnfilter selected' : 'fnfilter unselected'
          }
        >
          <Dropdown.Menu>{containerCmp}</Dropdown.Menu>
        </Dropdown>
        {true && (
          <Icon
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

const customBucketAggregationContainerElement = ({ valuesCmp }) => (
  <>{valuesCmp}</>
);

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
        <Icon name="search" />
        Keine Resultate gefunden.
      </Header>
      {/* {queryString && <em>Current search "{queryString}"</em>}
      <br /> */}
      <Button
        primary
        onClick={() => {
          resetQuery();
          // todo click cross of search input field
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
    <Header>
      <Header.Content className="header-content">
        <div className="sort-by">
          <FormattedMessage id="Sort By:" defaultMessage="Sort by:" />
        </div>
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
      </Header.Content>
    </Header>
  );
};

const defaultOverriddenComponents = {
  'ResultsList.item.elasticsearch': CustomResultsListItem,
  'Count.element': myCountElement,
  'ActiveFilters.element': myActiveFiltersElement,
  'EmptyResults.element': customEmpytResultsElement,
  'Sort.element.volto': customSort,
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
  const {
    search_url = data.elastic_search_api_url || 'http://localhost:9200',
    search_index = data.elastic_search_api_index || 'esploneindex',
    relocation = data.relocation || '',
    relocationcontext = data.relocationcontext || null,
  } = data;

  overriddenComponents = overriddenComponents ?? {
    ...defaultOverriddenComponents,
    ...(filterLayout === 'dropdown' && dropdownOverriddenComponents),
  };

  const dispatch = useDispatch();

  const [isClient, setIsClient] = React.useState(null);
  React.useEffect(() => setIsClient(true), []);
  let location = useLocation();

  const searchApi = new ESSearchApi({
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
  });

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

  const onKeyUpHandler = (event) => {
    const el = document.querySelector('.navigation-dropdownmenu');
    if (el) {
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        el.scrollIntoView();
      }
    }
  };

  return (
    <Segment vertical>
      {__CLIENT__ && (
        <OverridableContext.Provider value={overriddenComponents}>
          <ReactSearchKit
            searchApi={searchApi}
            eventListenerEnabled={true}
            initialQueryState={initialState}
          >

            <Container>
              {typeof document !== 'undefined' &&
              relocationcontext &&
              location?.pathname === relocationcontext &&
              relocation.length > 0 ? (
                <Portal
                  node={
                    __CLIENT__ &&
                    document.querySelectorAll(relocation) &&
                    document.querySelectorAll(relocation)[0]
                  }
                >
                  <div className="searchbar-wrapper">
                    <SearchBar
                      placeholder="Suche"
                      autofocus="true"
                      uiProps={{
                        icon: 'search',
                        iconPosition: 'left',
                        onKeyUp: onKeyUpHandler,
                        class: 'searchbarinput',
                      }}
                    />
                    <Icon
                      basic
                      icon
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
                          autofocus="true"
                          uiProps={{
                            icon: 'search',
                            iconPosition: 'left',
                            onKeyUp: onKeyUpHandler,
                          }}
                        />
                        <Icon
                          basic
                          icon
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
                      title="Komponenten"
                      agg={{
                        field: 'kompasscomponent',
                        aggName:
                          'kompasscomponent_agg.inner.kompasscomponent_token',
                      }}
                    />
                    <BucketAggregation
                      title="Informationstyp"
                      agg={{
                        field: 'informationtype',
                        aggName:
                          'informationtype_agg.inner.informationtype_token',
                      }}
                    />
                    <BucketAggregation
                      title="Zielpublikum"
                      agg={{
                        field: 'targetaudience',
                        aggName:
                          'targetaudience_agg.inner.targetaudience_token',
                      }}
                    />
                    <BucketAggregation
                      title="Organisationseinheit"
                      agg={{
                        field: 'organisationunit',
                        aggName:
                          'organisationunit_agg.inner.organisationunit_token',
                      }}
                    />
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
