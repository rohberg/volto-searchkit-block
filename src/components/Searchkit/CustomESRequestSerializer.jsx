import { extend, isEmpty } from 'lodash';

import { listFields, nestedFields } from './constants.js';

export class CustomESRequestSerializer {
  getFilters = (filters) => {
    /**
     * input: [
     *   [ 'type_agg', 'value1' ]
     *   [ 'type_agg', 'value2', [ 'subtype_agg', 'a value' ] ]
     * ]
     */
    const aggValueObj = {};

    const getChildFilter = (filter) => {
      const aggName = filter[0];
      const fieldValue = filter[1];
      if (aggName in aggValueObj) {
        aggValueObj[aggName].push(fieldValue);
      } else {
        aggValueObj[aggName] = [fieldValue];
      }
      const hasChild = filter.length === 3;
      if (hasChild) {
        getChildFilter(filter[2]);
      }
    };

    filters.forEach((filterObj) => {
      getChildFilter(filterObj);
    });

    /**
     * output: {
     *   type_agg: ['value1', 'value2']
     *   subtype_agg: [ 'a value' ]
     * }
     */
    return aggValueObj;
  };

  /**
   * Return a serialized version of the app state `query` for the API backend.
   * @param {object} stateQuery the `query` state to serialize
   */
  serialize = (stateQuery) => {
    const { queryString, sortBy, sortOrder, page, size, filters } = stateQuery;
    // console.debug('CustomESRequestSerializer queryString', queryString);
    // console.debug('CustomESRequestSerializer sortBy', sortBy);
    // console.debug('CustomESRequestSerializer filters', filters);
    // console.debug('CustomESRequestSerializer ', stateQuery);

    const bodyParams = {};

    if (!isEmpty(queryString)) {
      let qs = queryString
        .split(' ')
        .map((s) => s + '~')
        .join(' ');
      // bodyParams['query'] = {
      //   query_string: {
      //     query: qs,
      //   },
      // };
      let simpleFields = [
        'title^1.4',
        'id',
        'description^1.2',
        'subjects^1.4',
        'freemanualtags^1.4',
        'blocks_plaintext',
      ];
      let nestedFields = ['manualfile__extracted.content'];
      let shouldList = nestedFields.map((fld) => {
        return {
          nested: {
            path: fld.split('.')[0],
            query: {
              query_string: {
                query: qs,
                fields: [fld],
              },
            },
          },
        };
      });
      shouldList.push({
        query_string: {
          query: qs,
          fields: simpleFields,
        },
      });
      bodyParams['query'] = {
        bool: {
          should: shouldList,
        },
      };
    }

    if (sortBy !== 'bestmatch') {
      bodyParams['sort'] = bodyParams['sort'] || [];
      const sortObj = {};
      sortObj[sortBy] = sortOrder && sortOrder === 'desc' ? 'desc' : 'asc';
      bodyParams['sort'].push(sortObj);
    }

    if (size > 0) {
      bodyParams['size'] = size; // batch size
    }

    if (page > 0) {
      const s = size > 0 ? size : 0;
      const from = (page - 1) * s;
      bodyParams['from'] = from;
    }

    // create post filters with the given filters
    // TODO fieldvalues with list of token, title dicts
    // "post_filter": {
    //   "bool": {
    //       "must": [
    //           {
    //               "terms": {
    //                   "kompasscomponent.token": ["BEW"]
    //               }
    //           }
    //       ]
    //   }
    // },

    // TODO 'kompasscomponent_agg.inner.kompasscomponent_token' or without inner
    const aggFieldsMapping = {
      freemanualtags_agg: 'freemanualtags',
      'kompasscomponent_agg.inner.kompasscomponent_token': 'kompasscomponent',
      'targetaudience_agg.inner.targetaudience_token': 'targetaudience',
      'organisationunit_agg.inner.organisationunit_token': 'organisationunit',
      'informationtype_agg.inner.informationtype_token': 'informationtype',
    };

    let terms = [];
    terms.push({
      terms: {
        portal_type: ['Manual'],
      },
    });
    terms.push({
      terms: {
        review_state: ['internally_published', 'private', 'draft'],
      },
    });

    let filter = [];
    if (filters.length) {
      // ES needs the field name as field, get the field name from the aggregation name
      const aggValueObj = this.getFilters(filters);
      // convert to object
      // console.debug('serialize: aggValueObj', aggValueObj);
      const additionalterms = Object.keys(aggValueObj).reduce(
        (accumulator, aggName) => {
          const obj = {};
          const fieldName = aggFieldsMapping[aggName];
          obj[fieldName] = aggValueObj[aggName];
          if (listFields.includes(fieldName)) {
            accumulator.push({ terms: obj });
          }
          return accumulator;
        },
        [],
      );
      // console.debug('serialize: additionalterms', additionalterms);
      terms = terms.concat(additionalterms);

      // console.debug('aggValueObj', aggValueObj);
      filter = Object.keys(aggValueObj).reduce((accumulator, aggName) => {
        const obj = {};
        const fieldName = aggFieldsMapping[aggName];
        obj[fieldName] = aggValueObj[aggName];
        if (nestedFields.includes(fieldName)) {
          accumulator.push({
            nested: {
              path: fieldName,
              query: {
                bool: {
                  must: [
                    {
                      terms: { [fieldName + '.token']: aggValueObj[aggName] },
                    },
                  ],
                },
              },
            },
          });
        }
        return accumulator;
      }, []);
    }

    /**
     * ES post_filter
     */
    // listFields
    const post_filter = { bool: { must: terms } };
    // nestedFields
    // console.debug('filter', filter);
    if (!isEmpty(filter)) {
      post_filter['bool']['filter'] = filter;
    }
    // console.debug('post_filter', post_filter);
    bodyParams['post_filter'] = post_filter;

    /**
     * Aggregations
     */

    // aggregations
    bodyParams['aggs'] = {};

    // 1. aggregations of listFields
    Object.keys(aggFieldsMapping).map((aggName) => {
      const fieldName = aggFieldsMapping[aggName];
      // console.debug('aggs', fieldName, listFields.includes(fieldName));
      if (listFields.includes(fieldName)) {
        const aggBucketTermsComponent = {
          [aggName]: { terms: { field: fieldName } },
        };
        extend(bodyParams['aggs'], aggBucketTermsComponent);
      }
    });

    // 2. aggregations of nestedFields
    Object.keys(aggFieldsMapping).map((aggName) => {
      // console.debug('nestedFields', nestedFields);
      const myaggs = aggName.split('.');
      const fieldName = aggFieldsMapping[aggName];
      // console.debug('aggs', fieldName, nestedFields.includes(fieldName));
      if (nestedFields.includes(fieldName)) {
        // console.debug('fieldName in nestedFields:', fieldName, aggName);

        const filter_debug = {
          nested: {
            path: 'informationtype',
            query: {
              bool: {
                must: [
                  {
                    terms: {
                      'informationtype.token': ['Anleitung', 'FAQ'],
                    },
                  },
                ],
              },
            },
          },
        };

        function aggregation_filter(agg) {
          // agg is a key of aggFieldsMapping.
          // something like 'kompasscomponent_agg.inner.kompasscomponent_token'
          // return filter_debug;
          return isEmpty(filter)
            ? { match_all: {} }
            : {
                bool: {
                  filter: filter.filter(
                    (el) => !agg[0].startsWith(el.nested.path),
                  ),
                },
              };
        }

        // const aggBucketTermsComponent_old = {
        //   [myaggs[0]]: {
        //     nested: {
        //       path: fieldName,
        //     },
        //     aggs: {
        //       [myaggs[1]]: {
        //         terms: {
        //           field: fieldName + '.token',
        //           order: { _key: 'asc' },
        //         },
        //         aggs: {
        //           somemoredatafromelasticsearch: {
        //             top_hits: { size: 1, _source: { include: [fieldName] } },
        //           },
        //         },
        //       },
        //     },
        //   },
        // };
        const aggBucketTermsComponent = {
          [myaggs[0]]: {
            aggs: {
              inner: {
                nested: {
                  path: fieldName,
                },
                aggs: {
                  [myaggs[2]]: {
                    terms: {
                      field: fieldName + '.token',
                      order: {
                        _key: 'asc',
                      },
                      size: 30, // number of buckets
                    },
                    aggs: {
                      somemoredatafromelasticsearch: {
                        top_hits: {
                          size: 1,
                          _source: { include: [fieldName] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };
        const flt = aggregation_filter(myaggs);
        if (!isEmpty(flt)) {
          aggBucketTermsComponent[myaggs[0]].filter = flt;
        }
        extend(bodyParams['aggs'], aggBucketTermsComponent);
      }
    });
    // console.debug(
    //   'CustomESRequestSerializer serialize returns bodyParams',
    //   bodyParams,
    // );
    return bodyParams;
  };
}

/**
 * payload demo
 */
/*
{
  "size": 10,
  "from": 0,
  "aggs": {
      "tags_agg": {
          "terms": {
              "field": "tags"
          }
      },
      "type_agg": {
          "terms": {
              "field": "employee_type.type"
          },
          "aggs": {
              "subtype_agg": {
                  "terms": {
                      "field": "employee_type.subtype"
                  }
              }
          }
      }
  }
}
*/
