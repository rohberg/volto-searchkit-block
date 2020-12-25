const applyConfig = (config) => {
  config.settings.searchkit = {
    ...config.settings.searchkit,
    esProxyWhitelist: {
      GET: ['^/_aliases', '^/_all'],
      POST: ['^/_search', /^\/[\w\d.-]+\/_search/],
    },
  };

  if (__SERVER__) {
    // TODO: develop this further to support multiple proxied ES
    const target = process.env.ELASTIC_URL || 'http://localhost:9200';
    const esProxyMiddleware = require('./proxy').default;
    config.settings.expressMiddleware = [
      ...(config.settings.expressMiddleware || []),
      esProxyMiddleware(target),
    ];
  }

  return config;
};

export default applyConfig;
