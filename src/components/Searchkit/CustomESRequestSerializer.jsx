import { extend, isEmpty, keyBy, trim } from 'lodash';
import { getObjectFromObjectList } from '../helpers.jsx';

import { listFilterFields } from './constants.js';

export class CustomESRequestSerializer {
  constructor(config) {
    this.reviewstatemapping = config.reviewstatemapping;
    this.searchedFields = config.searchedFields;
    this.facet_fields = getObjectFromObjectList(config.facet_fields);
    this.allowed_content_types = config.allowed_content_types;
    this.allowed_review_states = config.allowed_review_states;
    this.search_sections = config.search_sections;
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
    const {
      queryString,
      sortBy,
      sortOrder,
      page,
      size,
      filters,
      hiddenParams,
    } = stateQuery;
    const bodyParams = {};
    const force_fuzzy = true; // search for `${word}` and `${word}~`

    let qs_tailored_should_notexact = [];
    let qs_tailored_should_exact = [];
    let qs_tailored_must_notexact = [];
    let qs_tailored_must_exact = [];
    let qs_tailored_mustNot_exact = [];

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

    const _removeQuotationMarks = (word) => {
      word.replace('"', '');
      word.replace("'", '');
      return word;
    };

    const _make_fuzzy_and_enrich_with_word_parts = (word) => {
      // EXCLUDE
      if (word.startsWith('-')) {
        qs_tailored_mustNot_exact.push(_removeQuotationMarks(word.slice(1)));
        return;
      }
      // MUST
      if (word.startsWith('+')) {
        if (word.includes('"') || word.includes('*') || word.includes('?')) {
          qs_tailored_must_exact.push(word.slice(1));
        } else {
          qs_tailored_must_notexact.push(word.slice(1));
        }
        return;
      }

      // WILDCARD
      if (word.includes('*') || word.includes('?')) {
        qs_tailored_should_exact.push(_removeQuotationMarks(word));
        return;
      }
      // EXACT
      if (word.includes('"')) {
        qs_tailored_should_exact.push(word);
        return;
      }

      // Words with hyphen
      let word_new;
      let wordpartlist = word.split('-'); // common hyphens
      if (wordpartlist.length > 1) {
        // word with hyphen
        let resultlist = [];
        wordpartlist.push(word);
        wordpartlist.forEach((el) => {
          if (force_fuzzy) {
            resultlist.push(`${el} ${el}~`);
          } else {
            resultlist.push(el);
          }
        });
        word_new = resultlist.join(' ');
      } else {
        // word without hyphen
        word_new = force_fuzzy ? `${word} ${word}~` : `${word}`;
      }
      qs_tailored_should_notexact.push(word_new);
      return;
    };

    if (!isEmpty(queryString)) {
      // - search fuzzy
      // - search also for word parts (LSR-Lehrbetrieb: search also for LSR and Lehrbetrieb)
      let words = queryString.trim().split(' ');
      words = words
        // filter out spaces and orphan "
        .filter((word) => word !== '' && word !== '"');

      words.forEach((word) => {
        word = _remove_orphan_leading_or_trailing_quotmarks(word);
        _make_fuzzy_and_enrich_with_word_parts(word);
      });

      let searchedFields = [...this.searchedFields];
      let searchedFields_exact = [...this.searchedFields];
      searchedFields_exact = searchedFields_exact.map((fld) => {
        const fieldname = fld.split('^')[0];
        return fld.replace(fieldname, `${fieldname}.exact`);
      });

      // Construction of query
      let shouldList = [];
      let mustList = [];
      let must_notList = [];

      qs_tailored_should_notexact.forEach((element) => {
        shouldList.push({
          query_string: {
            query: element,
            fields: searchedFields,
          },
        });
      });
      qs_tailored_should_exact.forEach((element) => {
        shouldList.push({
          query_string: {
            query: element,
            fields: searchedFields_exact,
          },
        });
      });

      qs_tailored_must_notexact.forEach((el) => {
        mustList.push({
          query_string: {
            query: el,
            fields: searchedFields,
          },
        });
      });
      qs_tailored_must_exact.forEach((element) => {
        mustList.push({
          query_string: {
            query: element,
            fields: searchedFields_exact,
          },
        });
      });
      qs_tailored_mustNot_exact.forEach((element) => {
        must_notList.push({
          query_string: {
            query: element,
            fields: searchedFields_exact,
          },
        });
      });

      bodyParams['query'] = {
        bool: {
          should: shouldList,
          must: mustList,
          must_not: must_notList,
        },
      };
      // console.debug("bodyParams['query']['bool']", bodyParams['query']['bool']);

      bodyParams['highlight'] = {
        number_of_fragments: 20,
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
            blocks_plaintext: {
              matched_fields: ['blocks_plaintext', 'blocks_plaintext.exact'],
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

    const getFieldnameFromAgg = (agg) => {
      return agg.split('.')[0].replace('_agg', '');
    };

    let terms = [];
    terms.push({
      terms: {
        portal_type: this.allowed_content_types,
      },
    });
    terms.push({
      terms: {
        review_state: this.allowed_review_states,
      },
    });
    // Push section.
    const filters_dict = keyBy(filters, (e) => {
      return e[0];
    });
    const section = filters_dict['section'];
    if (section && section[1] !== 'others') {
      terms.push({
        terms: {
          section: [section[1]],
        },
      });
    }

    let filter = [];
    if (filters.length) {
      // ES needs the field name as field, get the field name from the aggregation name
      const aggValueObj = this.getFilters(filters);
      // convert to object
      const additionalterms = Object.keys(aggValueObj).reduce(
        (accumulator, aggName) => {
          const obj = {};
          const fieldName = getFieldnameFromAgg(aggName);
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
        const fieldName = getFieldnameFromAgg(aggName);
        obj[fieldName] = aggValueObj[aggName];
        if (Object.keys(this.facet_fields).includes(fieldName)) {
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
    // console.debug('filter', filter);

    /**
     * ES post_filter
     */
    // listFilterFields
    const post_filter = { bool: { must: terms } };
    // facet_fields
    if (!isEmpty(filter)) {
      post_filter['bool']['filter'] = [...filter];
    }

    // Exclude sections
    if (section && section[1] === 'others') {
      post_filter['bool']['must_not'] = [
        {
          terms: {
            section: this.search_sections.items.map((el) => {
              return el.section;
            }),
          },
        },
      ];
    }
    bodyParams['post_filter'] = post_filter;
    console.debug(
      "bodyParams['post_filter']['bool']",
      bodyParams['post_filter']['bool'],
    );

    /**
     * Aggregations
     */

    // aggregations
    bodyParams['aggs'] = {};

    // 1. aggregations of listFields
    listFilterFields.map((fieldName) => {
      const aggBucketTermsComponent = {
        [`${fieldName}_agg`]: { terms: { field: fieldName } },
      };
      extend(bodyParams['aggs'], aggBucketTermsComponent);
    });

    // 2. aggregations of facet_fields

    if (Object.keys(this.facet_fields).length > 0) {
      Object.keys(this.facet_fields).map((fieldName) => {
        const myaggs = [`${fieldName}_agg`, 'inner', `${fieldName}_token`];

        function aggregation_filter(agg) {
          // agg is a key of aggFieldsMapping.
          // something like 'kompasscomponent_agg.inner.kompasscomponent_token'
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
      });
    }

    // console.debug('CustomESRequestSerializer bodyParams', bodyParams);
    return bodyParams;
  };
}
