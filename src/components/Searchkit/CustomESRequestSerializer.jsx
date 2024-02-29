import { extend, isEmpty, keyBy, trim } from 'lodash';
import { getObjectFromObjectList } from '../helpers.jsx';

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
    const { queryString, sortBy, sortOrder, page, size, filters } = stateQuery;
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
        // filter out spaces, orphan ", "AND", and "OR"
        .filter((word) => !['', '"', 'AND', 'OR', 'NOT'].includes(word));

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
      return agg.replace('_agg', '');
    };

    // Generate terms of global filters
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

    const filters_dict = keyBy(filters, (e) => {
      return e[0];
    });
    const section = filters_dict['section'];

    // Generate terms of selected options
    let terms_of_selected_options = [];
    if (filters.length) {
      // Convert to object.
      const aggValueObj = this.getFilters(filters);

      terms_of_selected_options = Object.keys(aggValueObj).reduce(
        (accumulator, aggName) => {
          const obj = {};
          const fieldName = getFieldnameFromAgg(aggName);
          if (fieldName === 'subjects') {
            obj['subjects.keyword'] = aggValueObj[aggName];
          } else {
            obj[fieldName] = aggValueObj[aggName];
          }
          if (
            aggName !== 'section' ||
            JSON.stringify(aggValueObj[aggName]) !== '["others"]'
          ) {
            accumulator.push({ terms: obj });
          }
          return accumulator;
        },
        [],
      );
    }

    /**
     * ES post_filter
     */

    const post_filter = {
      bool: { must: terms.concat(terms_of_selected_options) },
    };

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

    /**
     * Aggregations
     */
    const filter = (fieldName) => {
      let myAggsFilter = terms;
      // Add selected filters
      const terms_of_selected_options_without_self =
        terms_of_selected_options.filter(
          (el) => !Object.keys(el.terms).includes(fieldName),
      );
      myAggsFilter = myAggsFilter.concat(
        terms_of_selected_options_without_self,
      );

      // So far
      let res = myAggsFilter
        ? {
            bool: {
              must: myAggsFilter,
            },
          }
        : null;

      if (fieldName !== 'section') {
        if (section) {
          if (section[1] === 'others') {
            res = res || {
              bool: {},
            };
            res.bool.must_not = [
              {
                terms: {
                  section: this.search_sections.items.map((el) => {
                    return el.section;
                  }),
                },
              },
            ];
          } else {
            // // Must section
            // res = res || {
            //   bool: {
            //     must: [],
            //   },
            // };
            // res.bool.must.push([section[1]]);
          }
        }
      }

      return res;
    };

    bodyParams['aggs'] = {};
    let aggregations = Object.keys(this.facet_fields);
    aggregations.push('section');
    aggregations.forEach((fieldName) => {
      let aggName = `${fieldName}_agg`;
      let field = fieldName;
      if (fieldName === 'Subject') {
        field = 'subjects.keyword';
        aggName = 'subjects_agg';
      }
      if (fieldName === 'section') {
        field = 'section';
      }
      let aggBucketTermsComponent = {
        [aggName]: {
          aggs: {
            [aggName]: {
              terms: {
                field: `${field}`,
                order: {
                  _key: 'asc',
                },
                size: 500, // number of buckets
              },
            },
            somemoredatafromelasticsearch: {
              top_hits: {
                size: 1,
                _source: { includes: [field] },
              },
            },
          },
        },
      };
      const filter_fieldname = filter(fieldName);
      if (filter_fieldname) {
        aggBucketTermsComponent[aggName].filter = filter_fieldname;
      }
      extend(bodyParams['aggs'], aggBucketTermsComponent);
    });

    return bodyParams;
  };
}
