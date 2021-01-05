export const SearchBlockSchema = {
  title: 'Search',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'elastic_search_api_url',
        'elastic_search_api_index',
        'relocation',
        'relocationcontext',
      ],
    },
  ],
  properties: {
    elastic_search_api_url: {
      title: 'Elastic Search API URL',
      default: 'http://localhost:9200',
    },
    elastic_search_api_index: {
      title: 'Elastic Search API Index',
      default: 'esploneindex',
    },
    relocation: {
      title: 'Relocation',
      description:
        'Selector for relaction of search bar. Leave empty to keep search bar in block.',
    },
    relocationcontext: {
      title: 'Relocation context',
      description: 'Path where search bar should be relocated',
    },
  },
  required: ['elastic_search_api_url', 'elastic_search_api_index'],
};
