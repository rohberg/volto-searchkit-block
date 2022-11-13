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
        'nestedFilterFields',
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
      title: 'Searchable fields with boosting',
      description: 'Type fieldnames to search in field names. Type title^1.4 to boost the title 40%.',
      type: 'array',
      creatable: true,
      default: ['title^1.4', 'description^1.2'],
    },
    nestedFilterFields: {
      title: 'Facets',
      description: 'Fields to filter on.',
      type: 'array',
      creatable: true,
      default: ['informationtype'],
    },
    allowed_content_types: {
      title: 'Types',
      description: 'Restrict types to display.',
      type: 'array',
      creatable: true,
      default: ['News Item', 'Document'],
    },
    allowed_review_states: {
      title: 'States',
      description: 'Restrict states to display.',
      type: 'array',
      creatable: true,
      default: ['published'],
    },
    relocation: {
      title: 'Relocation',
      description:
        'CSS selector for relocation of search bar. Leave empty to keep search bar in block.',
    },
  },
  required: ['elastic_search_api_url', 'elastic_search_api_index'],
};
