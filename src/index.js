const applyConfig = (config) => {
  config.settings.searchkitblock = {
    ...config.settings.searchkitblock,
    elasticurl: process.env.ELASTIC_URL || 'http://localhost:9200/plone2020',
  };
  return config;
};

export default applyConfig;
