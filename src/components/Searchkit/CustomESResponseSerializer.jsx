// TODO add data of .title to serialized response
// aggregations.organisationunit_agg.organisationunit_token.buckets[1].somemoredatafromelasticsearch.hits.hits[0]._source.title

import { forEach, has } from 'lodash';

function _pimpedAggregations(aggregations) {
  let result = Object.assign({}, aggregations);
  let buckets = [];
  Object.keys(result).forEach((element) => {
    if (result[element].buckets) {
      buckets = result[element].buckets;
    } else {
      forEach(result[element].inner, function (value, key) {
        if (has(value, 'buckets')) {
          buckets = result[element].inner[key].buckets;
        }
      });
    }
    buckets &&
      buckets.forEach((bucket) => {
        bucket.label =
          bucket.somemoredatafromelasticsearch?.hits.hits[0]._source.title ??
          bucket.key;
      });
  });

  return result;
}

export class CustomESResponseSerializer {
  constructor() {
    this.serialize = this.serialize.bind(this);
  }

  /**
   * Return a serialized version of the API backend response for the app state `results`.
   * @param {object} payload the backend response payload
   */
  serialize(payload) {
    const { aggregations, hits } = payload;
    return {
      aggregations: _pimpedAggregations(aggregations) || {},
      hits: hits.hits.map((hit) => hit._source),
      total: hits.total.value,
    };
  }
}
