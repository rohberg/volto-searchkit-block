// TODO update counts of BucketAggregation on selection of filter
import React, { useEffect } from 'react';

import { OverridableContext } from 'react-overridable';
import { Link } from 'react-router-dom';
import _truncate from 'lodash/truncate';
import {
  Button,
  Card,
  Container,
  Dropdown,
  Grid,
  Item,
  List,
  Label,
  Menu,
  Segment,
} from 'semantic-ui-react';
import {
  BucketAggregation,
  EmptyResults,
  Error,
  ReactSearchKit,
  ResultsLoader,
  withState,
} from 'react-searchkit';

import { ESSearchApi } from '../Searchkit/ESSearchApi';
import { CustomESRequestSerializer } from '../Searchkit/CustomESRequestSerializer';
import { Results } from '../Searchkit/Results';

import { settings } from '~/config';
import { NoSSR } from '../helpers';

import { useDispatch, useSelector } from 'react-redux';
import { flattenToAppURL } from '@plone/volto/helpers';
import { flattenESUrlToPath } from '../helpers';

import './less/public.less';

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
        <Item.Header as={Link} to={flattenESUrlToPath(result['@id'])}>
          {result.title}
          {/* <p>result['@id']: {result['@id']}</p>
          <p>
            flattenESUrlToPath(result['@id']):{' '}
            {flattenESUrlToPath(result['@id'])}
          </p> */}
        </Item.Header>
        <Item.Description>
          {_truncate(result.description, { length: 200 })}
        </Item.Description>
        <Item.Extra>
          {result.kompasscomponent?.map((item) => {
            let tito = item.title || item.token;
            return (
              <Label
                key={tito}
                color={`red`}
                size="mini"
                as="a"
                href={`/dokumentation/suche?q=&f=kompasscomponent_agg.kompasscomponent_token%3A${tito}&l=list&p=1`}
              >
                {tito}
              </Label>
            );
          })}
          {result.targetaudience?.map((item) => {
            let tito_foo = item.title || item.token;
            return (
              <Label
                key={tito_foo}
                color={`orange`}
                basic
                size="mini"
                as="a"
                href={`/dokumentation/suche?q=&f=targetaudience_agg.targetaudience_token%3A${tito_foo}&l=list&p=1`}
              >
                {tito_foo}
              </Label>
            );
          })}
          {result.organisationunit?.map((item) => {
            let tito = item.title || item.token;
            return (
              <Label
                key={tito}
                color={`purple`}
                basic
                size="mini"
                as="a"
                href={`/dokumentation/suche?q=&f=organisationunit_agg.organisationunit_token%3A${tito}&l=list&p=1`}
              >
                {tito}
              </Label>
            );
          })}
          {result.informationtype?.map((item) => {
            let tito = item.title || item.token;
            return (
              <Label
                key={tito}
                color={`violet`}
                basic
                size="mini"
                as="a"
                href={`/dokumentation/suche?q=&f=informationtype_agg.informationtype_token%3A${tito}&l=list&p=1`}
              >
                {tito}
              </Label>
            );
          })}

          <div className="freemanualtags">
            {result.freemanualtags?.map((item) => {
              let tito = item;
              return (
                <Label key={tito} color={`pink`} tag size="mini">
                  {tito}
                </Label>
              );
            })}
          </div>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

const myCountElement = ({ totalResults }) => <div>{totalResults} Treffer</div>;

// One Filter of Faceted Navigation
const customBucketAggregationElement = (props) => {
  // console.debug('customBucketAggregationElement', props);
  const { title, containerCmp } = props;
  const selectedFilters = containerCmp.props.selectedFilters.map((el) => el[1]);
  // console.debug(selectedFilters);
  return (
    containerCmp && (
      // <Card
      //   className={
      //     selectedFilters.length ? 'fnfilter selected' : 'fnfilter unselected'
      //   }
      // >
      //   <Card.Content>
      //     <Card.Description>
      //       {selectedFilters.length ? selectedFilters.join(' ') : title}
      //     </Card.Description>
      //   </Card.Content>
      //   <Card.Content extra>{containerCmp}</Card.Content>
      // </Card>

      <Dropdown
        fluid
        text={selectedFilters.length ? selectedFilters.join(' ') : title}
        className={
          selectedFilters.length ? 'fnfilter selected' : 'fnfilter unselected'
        }
      >
        <Dropdown.Menu>
          {containerCmp}
          {/* <Dropdown.Item text='New' />
          <Dropdown.Item text='Open...' description='ctrl + o' />
          <Dropdown.Item icon='trash' text='Move to trash' />
          <Dropdown.Divider />
          <Dropdown.Item text='Download As...' />
          <Dropdown.Item text='Publish To Web' />
          <Dropdown.Item text='E-mail Collaborators' /> */}
        </Dropdown.Menu>
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
    ? bucket.label
    : `${keyField} (${bucket.doc_count})`;
  const childAggCmps = getChildAggCmps(bucket);
  return (
    <Dropdown.Item key={bucket.key}>
      {/* <Checkbox
        label={label}
        value={bucket.key}
        onClick={() => onFilterClicked(bucket.key)}
        checked={isSelected}
      /> */}
      <Item onClick={() => onFilterClicked(bucket.key)}>{label}</Item>
      {childAggCmps}
    </Dropdown.Item>
  );
};

const overriddenComponents = {
  // 'BucketAggregation.element': customBucketAggregationElement,
  // 'BucketAggregationContainer.element': customBucketAggregationContainerElement,
  // 'BucketAggregationValues.element': customBucketAggregationValuesElement,
  'ResultsList.item.elasticsearch': CustomResultsListItem,
  'Count.element': myCountElement,
};

const initialState = {
  queryString: '',
  layout: 'list',
  page: 1,
  size: 10,
};

const FacetedSearch = ({ data, location }) => {
  const {
    search_url = data.elastic_search_api_url || 'http://localhost:9200',
    search_index = data.elastic_search_api_index || 'esploneindex',
  } = data;

  const dispatch = useDispatch();

  const searchApi = new ESSearchApi({
    axios: {
      // url: 'http://localhost:9200/esploneindex/_search',
      url: search_url + '/' + search_index + '/_search',
      timeout: 5000,
      headers: { Accept: 'application/json' },
    },
    es: {
      requestSerializer: CustomESRequestSerializer,
    },
  });

  useEffect(() => {
    // TODO set value of input field
    let searchParams = new URLSearchParams(location?.search);
    let q = searchParams.get('q');
    console.debug('FNView useEffect: querystring of location', q, location);
  }, [location, dispatch]);

  return (
    <Segment vertical>
      <NoSSR>
        <OverridableContext.Provider value={overriddenComponents}>
          <ReactSearchKit
            searchApi={searchApi}
            eventListenerEnabled={true}
            initialQueryState={initialState}
          >
            <Container>
              <Grid relaxed style={{ padding: '2em 0' }}>
                <Grid.Row>
                  <Grid.Column width={12} className="facetedsearch_filter">
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
                      <OnResults />
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
