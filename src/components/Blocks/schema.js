// TODO translations title and descriptions of fields
import {
  hasNonValueOperation,
  hasDateOperation,
} from '@plone/volto/components/manage/Blocks/Search/utils';
import messages from '../../messages';

const FacetSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.facet),
  addMessage: intl.formatMessage(messages.add, {
    type: intl.formatMessage(messages.facet),
  }),
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
const ExtrainfoSchema = ({ intl }) => {
  const facetschema = FacetSchema({ intl });
  const extrainfoschema = {
    ...facetschema,
    title: intl.formatMessage(messages.metadata),
    addMessage: intl.formatMessage(messages.add, {
      type: intl.formatMessage(messages.metadata),
    }),
  };
  return extrainfoschema;
};

export const SearchBlockSchema = ({ data = {}, intl }) => {
  return {
    title: intl.formatMessage(messages.searchBlock),
    fieldsets: [
      {
        id: 'search',
        title: 'Search',
        fields: [
          'allowed_content_types',
          'allowed_review_states',
          'searchedFields',
          'batchSize',
        ],
      },
      {
        id: 'facets',
        title: intl.formatMessage(messages.facets),
        fields: [
          'facet_fields',
          'filterLayout',
          'search_sections',
          'allow_search_excluded_sections',
          'show_filter_for_excluded_sections',
        ],
      },
      {
        id: 'results',
        title: 'Results',
        fields: [
          'extrainfo_fields',
          'subjectsFieldname',
          'showNewsItemPublishedDate',
          'showEventStartDate',
        ],
      },
      {
        id: 'divers',
        title: 'Divers',
        fields: ['relocation'],
      },
    ],
    properties: {
      // elastic_search_api_url: {
      //   title:
      //     '(deprecated) (Set in collective.elastic environment variable) Elastic Search API URL',
      //   default: 'http://localhost:9200',
      // },
      // elastic_search_api_index: {
      //   title:
      //     '(deprecated) (Set in collective.elastic environment variable) Elastic Search API Index',
      //   default: 'esploneindex',
      // },
      search_sections: {
        title: intl.formatMessage(messages.searchInSections),
        description: intl.formatMessage(messages.searchInSectionsDescription),
        type: 'dict',
        factory: 'JSONField',
        widget: 'searchsectionswidget',
      },
      allow_search_excluded_sections: {
        title: 'Allow search everywhere except in sections',
        type: 'boolean',
      },
      show_filter_for_excluded_sections: {
        title: 'Show filter for excluded sections',
        type: 'boolean',
        default: true,
      },
      allowed_content_types: {
        title: 'Types',
        description: 'Restrict types to display.',
        type: 'array',
        widget: 'array',
        items: {
          vocabulary: { '@id': 'plone.app.vocabularies.UserFriendlyTypes' },
        },
      },
      allowed_review_states: {
        title: 'States',
        description: 'Restrict review states.',
        type: 'array',
        widget: 'array',
        items: {
          vocabulary: { '@id': 'plone.app.vocabularies.WorkflowStates' },
        },
      },
      searchedFields: {
        title: 'Searchable fields with boosting',
        description:
          'Type fieldnames to search in field names. Type title^1.4 to boost the title 40%.',
        type: 'array',
        creatable: true,
        default: ['title^1.4', 'description^1.2', 'blocks_plaintext'],
      },
      batchSize: {
        title: 'Batch size',
        type: 'number',
        default: 10,
      },
      facet_fields: {
        title: 'Facets',
        description: 'Fields to filter on.',
        widget: 'object_list',
        schema: FacetSchema({ intl }),
      },
      filterLayout: {
        title: intl.formatMessage(messages.facetWidget),
        // widget: SelectWidget,
        choices: [
          ['dropdown', 'Dropdown'],
          ['checkboxes', 'Checkboxes'],
        ],
        default: 'dropdown',
      },
      extrainfo_fields: {
        title: intl.formatMessage(messages.metadata),
        widget: 'object_list',
        schema: ExtrainfoSchema({ intl }),
      },
      subjectsFieldname: {
        title: 'Field name of tags field',
        description:
          'Show tags to search for. Let the field empty to not show tags.',
        default: 'subjects',
      },
      showNewsItemPublishedDate: {
        title: 'Show published date of news items',
        type: 'array',
        widget: 'array',
        items: {
          vocabulary: { '@id': 'plone.app.vocabularies.UserFriendlyTypes' },
        },
        default: ['News Item'],
      },
      showEventStartDate: {
        title: 'Show start date of events',
        type: 'array',
        widget: 'array',
        items: {
          vocabulary: { '@id': 'plone.app.vocabularies.UserFriendlyTypes' },
        },
        default: ['Event'],
      },
      relocation: {
        title: 'Relocation',
        description:
          'CSS selector for relocation of search bar. Leave empty to keep search bar in block.',
        default: '',
      },
    },
    required: [],
  };
};
