// TODO add data of .title to serialized response
// aggregations.organisationunit_agg.organisationunit_token.buckets[1].somemoredatafromelasticsearch.hits.hits[0]._source.title

import { forEach, has } from 'lodash';
import {
  addAppURL,
  isInternalURL,
  flattenToAppURL,
} from '@plone/volto/helpers';

import config from '@plone/volto/registry';

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
    this._getAllowedHits = this._getAllowedHits.bind(this);
  }

  _getAllowedHits(hits) {
    // return promise with array ot Promises. all of them resolve to Object(hit,status)
    let listOfPromises = hits.map((hit) => {
      return new Promise((resolve, reject) => {
        // fetch one
        fetch(
          hit['_source']['@id'].replace(this.backend_url, this.frontend_url),
        )
          .then((res) => {
            resolve({
              hit: hit,
              status: res.status,
            });
          })
          .catch((err) => {
            console.error('error while fetching', err);
          });
      });
    });
    return Promise.all(listOfPromises);
  }

  /**
   * Return a serialized version of the API backend response for the app state `results`.
   * @param {object} payload the backend response payload
   */

  async serialize(payload) {
    const { aggregations, hits } = payload;

    let filtered_hits = await this._getAllowedHits(hits.hits);
    filtered_hits = filtered_hits
      .filter((hit_info) => {
        return hit_info.status === 200;
      })
      .map((hit_info) => hit_info.hit);
    return new Promise((resolve, reject) => {
      resolve({
        aggregations: _pimpedAggregations(aggregations) || {},
        hits: filtered_hits.map((hit) => hit._source),
        total: hits.total.value < 11 ? filtered_hits.length : hits.total.value,
      });
    });
  }
}
