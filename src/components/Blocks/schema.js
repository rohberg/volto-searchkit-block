import { defineMessages } from 'react-intl';
import { SelectWidget } from '@plone/volto/components';
import { hasNonValueOperation, hasDateOperation } from '@plone/volto/components/manage/Blocks/Search/utils';


const messages = defineMessages({
  searchBlock: {
    id: 'Search block',
    defaultMessage: 'Search block',
  },
  facets: {
    id: 'Facets',
    defaultMessage: 'Facets',
  },
  facet: {
    id: 'Facet',
    defaultMessage: 'Facet',
  },
  label: {
    id: 'Label',
    defaultMessage: 'Label',
  },
  field: {
    id: 'Field',
    defaultMessage: 'Field',
  },
  multipleChoices: {
    id: 'Multiple choices?',
    defaultMessage: 'Multiple choices?',
  },
  facetWidget: {
    id: 'Facet widget',
    defaultMessage: 'Facet widget',
  },
  views: {
    id: 'views',
    defaultMessage: 'Views',
  },
  availableViews: {
    id: 'availableViews',
    defaultMessage: 'Available views',
  },
  showTotalResults: {
    id: 'Show total results',
    defaultMessage: 'Show total results',
  },
  metadata: {
    id: 'Meta data',
    defaultMessage: 'Meta data',
  }
});

const FacetSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.facet),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title', 'field'],
    },
  ],
  properties: {
    title: {
      title: intl.formatMessage(messages.label),
    },
    field: {
      title: intl.formatMessage(messages.field),
      widget: 'select_querystring_field',
      vocabulary: { '@id': 'plone.app.vocabularies.MetadataFields' },
      filterOptions: (options) => {
        // Only allow indexes that provide simple, fixed vocabularies.
        // This should be improved, together with the facets. The querystring
        // widget implementation should serve as inspiration for those dynamic
        // types of facets.
        return Object.assign(
          {},
          ...Object.keys(options).map((k) =>
            Object.keys(options[k].values || {}).length ||
            hasNonValueOperation(options[k].operations) ||
            hasDateOperation(options[k].operations)
              ? { [k]: options[k] }
              : {},
          ),
        );
      },
    },
  },
  required: ['field'],
});


export const SearchBlockSchema = ({ data = {}, intl }) => {
  return {
    title: intl.formatMessage(messages.searchBlock),    
    fieldsets: [
      {
        id: 'default',
        title: 'API',
        fields: [
          'elastic_search_api_url',
          'elastic_search_api_index',
          'backend_url',
          'frontend_url',
        ],
      },
      {
        id: 'search',
        title: 'Facets and results',
        fields: [
          'allowed_content_types',
          'allowed_review_states',
          'searchedFields',
          'facet_fields',
          'filterLayout',
          'extrainfo_fields',
          'subjectsFieldname',
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
        default: 'http://acme.example.com',
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
      searchedFields: {
        title: 'Searchable fields with boosting',
        description: 'Type fieldnames to search in field names. Type title^1.4 to boost the title 40%.',
        type: 'array',
        creatable: true,
        default: ['title^1.4', 'description^1.2'],
      },
      facet_fields: {
        title: 'Facets',
        description: 'Fields to filter on.',
        widget: 'object_list',
        schema: FacetSchema({ intl }),
      },
      filterLayout: {
        title: intl.formatMessage(messages.facetWidget),
        widget: SelectWidget,
        choices: [
          ['dropdown', 'Dropdown'],
          ['checkboxes', 'Checkboxes'],
        ],
        defaultValue: 'dropdown'
      },
      extrainfo_fields: {
        title: intl.formatMessage(messages.metadata),
        widget: 'object_list',
        schema: FacetSchema({ intl }),
      },
      subjectsFieldname: {
        title: 'Field name of tags field',
        description: 'Show tags to search for. Let the field empty to not show tags.',
        default: '',
      },
      relocation: {
        title: 'Relocation',
        description:
          'CSS selector for relocation of search bar. Leave empty to keep search bar in block.',
        default: '',
      },
    },
    required: ['elastic_search_api_url', 'elastic_search_api_index'],
  }
};
