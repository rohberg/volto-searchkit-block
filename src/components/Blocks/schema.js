export const SearchBlockSchema = {
  title: 'Search',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'elastic_search_api_url',
        'elastic_search_api_index',
        'backend_url',
        'frontend_url',
        'simpleFields',
        'allowed_content_types',
        'allowed_review_states',
        'relocation',
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
    backend_url: {
      title: 'Backend URL',
      default: 'http://localhost:8080/Plone',
    },
    frontend_url: {
      title: 'Frontend URL',
      default: 'http://igib.example.com',
    },
    simpleFields: {
      title: 'Fields',
      type: 'array',
      creatable: true,
      default: ['title^1.4', 'description^1.2'],
    },
    allowed_content_types: {
      title: 'Types',
      type: 'array',
      creatable: true,
      default: ['News Item', 'Document'],
    },
    allowed_review_states: {
      title: 'States',
      type: 'array',
      creatable: true,
      default: ['published'],
    },
    relocation: {
      title: 'Relocation',
      description:
        'Selector for relocation of search bar. Leave empty to keep search bar in block.',
    },
  },
  required: ['elastic_search_api_url', 'elastic_search_api_index'],
};
