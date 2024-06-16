function _pimpedAggregations(aggregations) {
  let result = Object.assign({}, aggregations);
  let buckets = [];
  Object.keys(result).forEach((element) => {
    if (result[element] && result[element][element].buckets) {
      result[element].buckets = result[element][element].buckets;
      buckets = result[element].buckets;
    } else {
      buckets = [];
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

  serialize(payload) {
    const { aggregations, hits } = payload;
    const foo = {
      aggregations: _pimpedAggregations(aggregations) || {},
      hits:
        hits?.hits.map((hit) => {
          // TODO Replace hack: Add highlights to _source data
          hit._source['highlight'] = hit.highlight;
          return hit._source;
        }) || [],
      total: hits?.total.value || 0,
    };
    return foo;
  }
}
