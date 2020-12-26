export const SearchBlockSchema = {
  title: 'Search',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['elastic_search_api'],
    },
  ],
  properties: {
    elastic_search_api_url: {
      title: 'Elastic Search API URL',
      default: 'http://localhost:9200',
    },
    elastic_search_api_index: {
      title: 'Elastic Search API Index',
      default: 'plone2020',
    },
  },
  required: ['elastic_search_api_url', 'elastic_search_api_index'],
};
