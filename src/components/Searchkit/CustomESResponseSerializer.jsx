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
  constructor(config) {
    this.serialize = this.serialize.bind(this);
    this.backend_url = config.backend_url;
    this.frontend_url = config.frontend_url;
  }

  /**
   * Return a serialized version of the API backend response for the app state `results`.
   * @param {object} payload the backend response payload
   */

  async serialize(payload) {
    const { aggregations, hits } = payload;

    return new Promise((resolve, reject) => {
      resolve({
        aggregations: _pimpedAggregations(aggregations) || {},
        hits: hits.hits.map((hit) => {
          // TODO Replace hack: Add highlights to _source data
          hit._source['highlight'] = hit.highlight;
          return hit._source;
        }),
        total: hits.total.value < 11 ? hits.hits.length : hits.total.value,
      });
    });
  }
}
