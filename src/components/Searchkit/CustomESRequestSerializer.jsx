import { extend, isEmpty, trim } from 'lodash';

import { listFilterFields, nestedFilterFields } from './constants.js';

export class CustomESRequestSerializer {
  constructor(config) {
    this.reviewstatemapping = config.reviewstatemapping;
    this.simpleFields = config.simpleFields;
  }
  /**
   * Convert Array of filters to Object of filters
   * @param  {Array}  filters Array of filters
   * @return {Object}         Object of filters
   * input: [
   *   [ 'type_agg', 'value1' ]
   *   [ 'type_agg', 'value2', [ 'subtype_agg', 'a value' ] ]
   * ]
   * output: {
   *   type_agg: ['value1', 'value2']
   *   subtype_agg: [ 'a value' ]
   * }
   */
  getFilters = (filters) => {
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
    return aggValueObj;
  };

  /**
   * Return a serialized version of the app state `query` for the API backend.
   * @param {object} stateQuery the `query` state to serialize
   */
  serialize = (stateQuery) => {
    const { queryString, sortBy, sortOrder, page, size, filters } = stateQuery;

    // TODO Make allowed_content_types configurable.
    let allowed_content_types = ['Manual'];
    // Check current users permissions
    let allowed_review_states = this.reviewstatemapping['Manual'];

    const bodyParams = {};

    const _remove_orphan_leading_or_trailing_quotmarks = (word) => {
      let word_without_plus_or_minus = trim(word, '+');
      word_without_plus_or_minus = trim(word_without_plus_or_minus, '-');
      if (
        !(
          word_without_plus_or_minus.startsWith('"') &&
          word_without_plus_or_minus.endsWith('"')
        ) &&
        !(
          !word_without_plus_or_minus.startsWith('"') &&
          !word_without_plus_or_minus.endsWith('"')
        )
      ) {
        return word.replace('"', '');
      }
      return word;
    };

    const _make_fuzzy_and_enrich_with_word_parts = (word) => {
      // fuzzy search and word parts (parts separated by '-') only if no wildcard and no quotation mark
      if (word.includes('"') || word.includes('*') || word.includes('?')) {
        return word;
      }

      // Take word parts into account. And force fuzzy search.
      if (word.startsWith('-')) {
        return word;
      }
      let result;
      let wordpartlist = word.split('-'); // common hyphens
      if (wordpartlist.length > 1) {
        let resultlist = [];
        wordpartlist.push(word);
        wordpartlist.forEach((el) => {
          resultlist.push(el);
          resultlist.push(`${el}~`);
        });
        console.debug('wordpartlist', wordpartlist);
        console.debug('resultlist', resultlist);
        result = resultlist.join(' ');
      } else {
        result = `${word} ${word}~`;
      }
      console.debug('result', result);
      return result;
    };

    if (!isEmpty(queryString)) {
      // - search fuzzy
      // - search also for word parts (LSR-Lehrbetrieb: search also for LSR and Lehrbetrieb)
      let qs_tailored = [];
      // let qs_tailored_exact = [];
      // let qs_tailored_must = [];
      // let qs_tailored_must_exact = [];
      let words = queryString.trim().split(' ');
      words = words
        // filter out spaces and orphan "
        .filter((word) => word !== '' && word !== '"');

      words.forEach((word) => {
        word = _remove_orphan_leading_or_trailing_quotmarks(word);
        word = _make_fuzzy_and_enrich_with_word_parts(word);
        qs_tailored.push(word);
      });
      console.debug('qs_tailored:', qs_tailored);

      let simpleFields = this.simpleFields;
      bodyParams['query'] = {
        query_string: {
          query: qs_tailored.join(' '),
          fields: simpleFields,
          quote_field_suffix: '.exact',
        },
      };

      bodyParams['highlight'] = {
        fields: [
          {
            title: {
              matched_fields: ['title', 'title.exact'],
              type: 'fvh',
            },
          },
          {
            description: {
              matched_fields: ['description', 'description.exact'],
              type: 'fvh',
            },
          },
          {
            freemanualtags_searchable: {
              matched_fields: [
                'freemanualtags_searchable',
                'freemanualtags_searchable.exact',
              ],
              type: 'fvh',
            },
          },
          {
            blocks_plaintext: {
              fragment_size: 150,
              matched_fields: ['blocks_plaintext', 'blocks_plaintext.exact'],
              type: 'fvh',
            },
          },
          {
            subjects: {
              matched_fields: ['subjects', 'subjects.exact'],
              type: 'fvh',
            },
          },
          // TODO highlight / matches in PDF
          {
            manualfilecontent: {
              matched_fields: ['manualfilecontent', 'manualfilecontent.exact'],
              type: 'fvh',
            },
          },
        ],
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
      // freemanualtags_agg: 'freemanualtags',
      'kompasscomponent_agg.inner.kompasscomponent_token': 'kompasscomponent',
      'targetaudience_agg.inner.targetaudience_token': 'targetaudience',
      'organisationunit_agg.inner.organisationunit_token': 'organisationunit',
      'informationtype_agg.inner.informationtype_token': 'informationtype',
    };

    let terms = [];
    terms.push({
      terms: {
        portal_type: allowed_content_types,
      },
    });
    // TODO check current user for review_state he has access to
    terms.push({
      terms: {
        review_state: allowed_review_states,
      },
    });

    let filter = [];
    if (filters.length) {
      // ES needs the field name as field, get the field name from the aggregation name
      const aggValueObj = this.getFilters(filters);
      // convert to object
      const additionalterms = Object.keys(aggValueObj).reduce(
        (accumulator, aggName) => {
          const obj = {};
          const fieldName = aggFieldsMapping[aggName];
          obj[fieldName] = aggValueObj[aggName];
          if (listFilterFields.includes(fieldName)) {
            accumulator.push({ terms: obj });
          }
          return accumulator;
        },
        [],
      );
      terms = terms.concat(additionalterms);

      filter = Object.keys(aggValueObj).reduce((accumulator, aggName) => {
        const obj = {};
        const fieldName = aggFieldsMapping[aggName];
        obj[fieldName] = aggValueObj[aggName];
        if (nestedFilterFields.includes(fieldName)) {
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
    // listFilterFields
    const post_filter = { bool: { must: terms } };
    // nestedFilterFields
    if (!isEmpty(filter)) {
      post_filter['bool']['filter'] = filter;
    }
    bodyParams['post_filter'] = post_filter;

    /**
     * Aggregations
     */

    // aggregations
    bodyParams['aggs'] = {};

    // 1. aggregations of listFields
    Object.keys(aggFieldsMapping).map((aggName) => {
      const fieldName = aggFieldsMapping[aggName];
      if (listFilterFields.includes(fieldName)) {
        const aggBucketTermsComponent = {
          [aggName]: { terms: { field: fieldName } },
        };
        extend(bodyParams['aggs'], aggBucketTermsComponent);
      }
    });

    // 2. aggregations of nestedFilterFields
    Object.keys(aggFieldsMapping).map((aggName) => {
      const myaggs = aggName.split('.');
      const fieldName = aggFieldsMapping[aggName];
      if (nestedFilterFields.includes(fieldName)) {
        // const filter_debug = {
        //   nested: {
        //     path: 'informationtype',
        //     query: {
        //       bool: {
        //         must: [
        //           {
        //             terms: {
        //               'informationtype.token': ['Anleitung', 'FAQ'],
        //             },
        //           },
        //         ],
        //       },
        //     },
        //   },
        // };

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
                          _source: { includes: [fieldName] },
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
    // console.debug('CustomESRequestSerializer bodyParams', bodyParams);
    return bodyParams;
  };
}
