import _get from 'lodash/get';
import _hasIn from 'lodash/hasIn';
import { CustomESRequestSerializer } from './CustomESRequestSerializer';
import { CustomESResponseSerializer } from './CustomESResponseSerializer';

export class PloneSearchApi {
  constructor(config) {
    this.fetchConfig = _get(config, 'fetchPayload', {});
    this.validateFetchConfig();
    this.initSerializers(config);
    this.search = this.search.bind(this);
    // this.elastic_search_api_url = config.elastic_search_api_url;
    // this.elastic_search_api_index = config.elastic_search_api_index;
  }

  validateFetchConfig() {
    if (!_hasIn(this.fetchConfig, 'url')) {
      throw new Error('PloneSearchApi config: `url` is required.');
    }
  }

  initSerializers(config) {
    const requestSerializerCls = _get(
      config,
      'es.requestSerializer',
      CustomESRequestSerializer,
    );
    const responseSerializerCls = _get(
      config,
      'es.responseSerializer',
      CustomESResponseSerializer,
    );

    this.requestSerializer = new requestSerializerCls({
      searchedFields: config.searchedFields,
      facet_fields: config.facet_fields,
      allowed_content_types: config.allowed_content_types,
      allowed_review_states: config.allowed_review_states,
      search_sections: config.search_sections,
      language: config.language,
    });
    this.responseSerializer = new responseSerializerCls({
      backend_url: config.backend_url,
      frontend_url: config.frontend_url,
    });
  }

  /**
   * Perform the backend request to search and return the serialized list of results for the app state `results`.
   * @param {string} stateQuery the `query` state with the user input
   */
  async search(stateQuery) {
    const payload = this.requestSerializer.serialize(stateQuery);
    // Extend paylod with url and index to address elasticsearch server
    try {
      const response = await fetch(this.fetchConfig.url, {
        method: 'POST',
        headers: this.fetchConfig.headers,
        body: JSON.stringify({
          elasticsearch_payload: payload,
          // elasticsearch_url: this.elastic_search_api_url,
          // elasticsearch_index: this.elastic_search_api_index,
        }),
      });
      // let results = await this.responseSerializer.serialize(response.data);
      let results = await response.json();
      if (results.message) {
        throw results;
        // throw new Error(`${results.type} ${results.message}`);
      }
      results = this.responseSerializer.serialize(results);
      return results;
    } catch (error) {
      throw error;
    }
  }
}
