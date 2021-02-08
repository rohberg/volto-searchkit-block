// TODO update counts of BucketAggregation on selection of filter
// TODO lacales actionProps, placeholder
import React, { useEffect } from 'react';

import { OverridableContext } from 'react-overridable';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import _truncate from 'lodash/truncate';

import { Portal } from 'react-portal';
import { Navigation } from '@plone/volto/components';

import {
  Button,
  Checkbox,
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
  ActiveFilters,
  BucketAggregation,
  EmptyResults,
  Error,
  ReactSearchKit,
  ResultsLoader,
  SearchBar,
  withState,
} from 'react-searchkit';

import { ESSearchApi } from '../Searchkit/ESSearchApi';
import { CustomESRequestSerializer } from '../Searchkit/CustomESRequestSerializer';
import { CustomESResponseSerializer } from '../Searchkit/CustomESResponseSerializer';
import { Results } from '../Searchkit/Results';

import { NoSSR } from '../helpers';

import { useDispatch } from 'react-redux';
import { flattenESUrlToPath } from '../helpers';

import './less/public.less';

// TODO configSearchFilterLayout: configurable layout of filters (menu cards or dropdown)
const configSearchFilterLayout = 'dropdown';

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
  return (
    <Item key={index}>
      <Item.Content>
        {result.informationtype?.length ? (
          <Item.Meta>
            <span>{result.informationtype[0].title}</span>
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
            {_truncate(result.description, { length: 200 })}
          </Link>
        </Item.Description>
        <Item.Extra className="metadata">
          {result.kompasscomponent?.length ? (
            <>
              <span>Komponenten: </span>
              {result.kompasscomponent?.map((item, index) => {
                let tito = item.title || item.token;
                return (
                  <Link
                    key={tito}
                    to={`/dokumentation/suche?q=&f=kompasscomponent_agg.kompasscomponent_token%3A${tito}&l=list&p=1`}
                  >
                    {tito}
                    {index < result.kompasscomponent.length - 1 ? ',' : null}
                  </Link>
                );
              })}
              <span className="metadataseparator">.</span>
            </>
          ) : null}
          {result.targetaudience?.length ? (
            <>
              <span>Zielpublikum: </span>
              {result.targetaudience?.map((item, index) => {
                let tito_foo = item.title || item.token;
                return (
                  <Link
                    key={tito_foo}
                    to={`/dokumentation/suche?q=&f=targetaudience_agg.targetaudience_token%3A${tito_foo}&l=list&p=1`}
                  >
                    {tito_foo}
                    {index < result.targetaudience.length - 1 ? ',' : null}
                  </Link>
                );
              })}
              <span className="metadataseparator">.</span>
            </>
          ) : null}
          {result.organisationunit?.length ? (
            <>
              <span>Organisationseinheit: </span>
              {result.organisationunit?.map((item, index) => {
                let tito = item.title || item.token;
                return (
                  <Link
                    key={tito}
                    to={`/dokumentation/suche?q=&f=organisationunit_agg.organisationunit_token%3A${tito}&l=list&p=1`}
                  >
                    {tito}
                    {index < result.organisationunit.length - 1 ? ',' : null}
                  </Link>
                );
              })}
              <span className="metadataseparator">.</span>
            </>
          ) : null}
          {result.freemanualtags?.length ? (
            <div className="freemanualtags">
              <span>Tags: </span>
              {result.freemanualtags?.map((item, index) => {
                let tito = item;
                return (
                  <Link key={tito} to={`/dokumentation/suche?q=${tito}`}>
                    {tito}
                    {index < result.freemanualtags.length - 1 ? (
                      ','
                    ) : (
                      <span></span>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

const myCountElement = ({ totalResults }) => (
  <div className="countlabel">{totalResults} Suchergebnisse</div>
);

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

// One single Filter of Faceted Navigation
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

  const removeAggFilters = (event) => {
    if (containerCmp.props.selectedFilters.length) {
      updateQueryFilters(containerCmp.props.selectedFilters);
    }
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    containerCmp && (
      <Dropdown
        fluid
        text={
          selectedFilters.length
            ? title + ': ' + selectedFilters.join(', ')
            : title
        }
        className={
          selectedFilters.length ? 'fnfilter selected' : 'fnfilter unselected'
        }
      >
        <div>
          {selectedFilters.length > 0 && (
            <Icon name="delete" onClick={(e) => removeAggFilters(e)} />
          )}
          <Dropdown.Menu>{containerCmp}</Dropdown.Menu>
        </div>
      </Dropdown>
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

let overriddenComponents = {
  'ResultsList.item.elasticsearch': CustomResultsListItem,
  'Count.element': myCountElement,
  'ActiveFilters.element': myActiveFiltersElement,
  'EmptyResults.element': customEmpytResultsElement,
};

if (configSearchFilterLayout === 'dropdown') {
  overriddenComponents = {
    ...overriddenComponents,
    ...{
      'BucketAggregation.element': customBucketAggregationElement,
      'BucketAggregationContainer.element': customBucketAggregationContainerElement,
      'BucketAggregationValues.element': customBucketAggregationValuesElement,
    },
  };
}

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
  {
    text: 'Alphabetisch',
    sortBy: 'sortable_title.keyword',
    sortOrder: 'asc',
  },
];

const initialState = {
  sortBy: 'bestmatch',
  sortOrder: 'asc',
  queryString: '',
  layout: 'list',
  page: 1,
  size: 10,
};

const FacetedSearch = ({ data }) => {
  const {
    search_url = data.elastic_search_api_url || 'http://localhost:9200',
    search_index = data.elastic_search_api_index || 'esploneindex',
    relocation = data.relocation || '',
    relocationcontext = data.relocationcontext || null,
  } = data;

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

  // useEffect(() => {
  //   // TODO set value of input field
  //   let searchParams = new URLSearchParams(location?.search);
  //   let q = searchParams.get('q');
  //   // console.debug('FNView useEffect: querystring of location', q, location);
  // }, [location, dispatch]);

  return (
    <Segment vertical>
      <NoSSR>
        <OverridableContext.Provider value={overriddenComponents}>
          <ReactSearchKit
            searchApi={searchApi}
            eventListenerEnabled={false}
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
                  <SearchBar
                    placeholder="Suche"
                    autofocus="true"
                    actionProps={{ content: 'Suche' }}
                    uiProps={{ icon: 'search', iconPosition: 'left' }}
                  />
                </Portal>
              ) : (
                <Grid relaxed style={{ padding: '2em 0' }}>
                  <Grid.Row>
                    <Grid.Column width={12}>
                      <SearchBar
                        placeholder="Suche"
                        autofocus="true"
                        actionProps={{ content: 'Suche' }}
                        uiProps={{ icon: 'search', iconPosition: 'left' }}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              )}

              <Grid relaxed style={{ padding: '2em 0' }}>
                <Grid.Row>
                  <Grid.Column
                    width={12}
                    className={
                      'facetedsearch_filter ' +
                      (configSearchFilterLayout === 'cards'
                        ? 'cards'
                        : 'dropdown')
                    }
                  >
                    <BucketAggregation
                      title="Komponenten"
                      agg={{
                        field: 'kompasscomponent',
                        aggName: 'kompasscomponent_agg.kompasscomponent_token',
                      }}
                    />
                    <BucketAggregation
                      title="Zielpublikum"
                      agg={{
                        field: 'targetaudience',
                        aggName: 'targetaudience_agg.targetaudience_token',
                      }}
                    />
                    <BucketAggregation
                      title="Organisationseinheit"
                      agg={{
                        field: 'organisationunit',
                        aggName: 'organisationunit_agg.organisationunit_token',
                      }}
                    />
                    <BucketAggregation
                      title="Informationstyp"
                      agg={{
                        field: 'informationtype',
                        aggName: 'informationtype_agg.informationtype_token',
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
      </NoSSR>
    </Segment>
  );
};

export default FacetedSearch;
