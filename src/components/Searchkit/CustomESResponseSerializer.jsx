// TODO add data of .title to serialized response
// aggregations.organisationunit_agg.organisationunit_token.buckets[1].somemoredatafromelasticsearch.hits.hits[0]._source.title

import { forEach, has } from 'lodash';
import {
  addAppURL,
  isInternalURL,
  flattenToAppURL,
  expandToBackendURL,
  getAuthToken,
} from '@plone/volto/helpers';

import { flattenESUrlToPath } from '../helpers';

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
    // TODO Do security check for array not check for each single item of array

    // return promise with array ot Promises. all of them resolve to Object(hit,status)
    const auth_token = getAuthToken();
    let listOfPromises = hits.map((hit) => {
      return new Promise((resolve, reject) => {
        // fetch one
        let fetchurl = expandToBackendURL(
          flattenESUrlToPath(hit['_source']['@id']),
        );
        fetch(fetchurl, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${auth_token}`,
          },
        })
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

    return new Promise((resolve, reject) => {
      resolve({
        aggregations: _pimpedAggregations(aggregations) || {},
        hits: hits.hits.map((hit) => {
          // TODO Replace hack: Add highlights to _source data
          hit._source['highlight'] = hit.highlight;
          // console.debug('hit.highlight', hit.highlight);
          return hit._source;
        }),
        total: hits.total.value < 11 ? hits.hits.length : hits.total.value,
      });
    });
  }
}
