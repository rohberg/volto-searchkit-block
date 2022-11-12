import _get from 'lodash/get';
import _hasIn from 'lodash/hasIn';
import axios from 'axios';
import { RequestCancelledError } from 'react-searchkit';
import { ESRequestSerializer } from './ESRequestSerializer';
import { ESResponseSerializer } from './ESResponseSerializer';

export class PloneSearchApi {
  constructor(config) {
    this.axiosConfig = _get(config, 'axios', {});
    this.validateAxiosConfig();
    this.initSerializers(config);
    this.initInterceptors(config);
    this.initAxios();
    this.search = this.search.bind(this);
    this.axiosCancelToken = axios.CancelToken;
  }

  validateAxiosConfig() {
    if (!_hasIn(this.axiosConfig, 'url')) {
      throw new Error('PloneSearchApi config: `node` field is required.');
    }
  }

  initInterceptors(config) {
    this.requestInterceptor = _get(config, 'interceptors.request', undefined);
    this.responseInterceptor = _get(config, 'interceptors.response', undefined);
  }

  initSerializers(config) {
    const requestSerializerCls = _get(
      config,
      'es.requestSerializer',
      ESRequestSerializer,
    );
    const responseSerializerCls = _get(
      config,
      'es.responseSerializer',
      ESResponseSerializer,
    );

    this.requestSerializer = new requestSerializerCls({
      simpleFields: config.simpleFields,
      allowed_content_types: config.allowed_content_types,
      allowed_review_states: config.allowed_review_states,
    });
    this.responseSerializer = new responseSerializerCls({
      backend_url: config.backend_url,
      frontend_url: config.frontend_url,
    });
  }

  initAxios() {
    this.http = axios.create(this.axiosConfig);
    this.addInterceptors();
  }

  addInterceptors() {
    if (this.requestInterceptor) {
      this.http.interceptors.request.use(
        this.requestInterceptor.resolve,
        this.requestInterceptor.reject,
      );
    }
    if (this.responseInterceptor) {
      this.http.interceptors.request.use(
        this.responseInterceptor.resolve,
        this.responseInterceptor.reject,
      );
    }
  }

  /**
   * Perform the backend request to search and return the serialized list of results for the app state `results`.
   * @param {string} stateQuery the `query` state with the user input
   */
  async search(stateQuery) {
    // cancel any previous request in case it is still happening
    this.axiosCancel && this.axiosCancel.cancel();
    // generate a new cancel token for this request
    this.axiosCancel = this.axiosCancelToken.source();

    const payload = this.requestSerializer.serialize(stateQuery);

    try {
      const response = await this.http.request({
        method: 'POST',
        data: payload,
      });

      // await backend permission check
      let results = await this.responseSerializer.serialize(response.data);
      return results;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new RequestCancelledError();
      } else {
        throw error;
      }
    }
  }
}
