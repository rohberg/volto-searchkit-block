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
      title: intl.formatMessage(messages.default),
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

// TODO: add translations
export const SearchBlockSchema = ({ data = {}, intl }) => {
  return {
    title: intl.formatMessage(messages.searchBlock),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.search),
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
        title: intl.formatMessage(messages.results),
        fields: [
          'extrainfo_fields',
          'subjectsFieldname',
          'showNewsItemPublishedDate',
          'showEventStartDate',
        ],
      },
      {
        id: 'divers',
        title: intl.formatMessage(messages.divers),
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
        title: intl.formatMessage(messages.allowSearchExcludedSections),
        type: 'boolean',
      },
      show_filter_for_excluded_sections: {
        title: intl.formatMessage(messages.showFilterForExcludedSections),
        type: 'boolean',
        default: true,
      },
      allowed_content_types: {
        title: intl.formatMessage(messages.types),
        description: intl.formatMessage(messages.restrictTypes),
        type: 'array',
        widget: 'array',
        items: {
          vocabulary: { '@id': 'plone.app.vocabularies.UserFriendlyTypes' },
        },
      },
      allowed_review_states: {
        title: intl.formatMessage(messages.states),
        description: intl.formatMessage(messages.restrictStates),
        type: 'array',
        widget: 'array',
        items: {
          vocabulary: { '@id': 'plone.app.vocabularies.WorkflowStates' },
        },
      },
      searchedFields: {
        title: intl.formatMessage(messages.searchableFields),
        description: intl.formatMessage(messages.searchableFieldsDescription),
        type: 'array',
        creatable: true,
        default: ['title^1.4', 'description^1.2', 'blocks_plaintext'],
      },
      batchSize: {
        title: intl.formatMessage(messages.batchSize),
        type: 'number',
        default: 10,
      },
      facet_fields: {
        title: intl.formatMessage(messages.facets),
        description: intl.formatMessage(messages.fieldsToFilterOn),
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
        title: intl.formatMessage(messages.fieldNameOfTagsField),
        description: intl.formatMessage(messages.showTagsToSearchFor),
        default: 'subjects',
      },
      showNewsItemPublishedDate: {
        title: intl.formatMessage(messages.showPublishedDateOfNewsItems),
        type: 'array',
        widget: 'array',
        items: {
          vocabulary: { '@id': 'plone.app.vocabularies.UserFriendlyTypes' },
        },
        default: ['News Item'],
      },
      showEventStartDate: {
        title: intl.formatMessage(messages.showStartDateOfEvents),
        type: 'array',
        widget: 'array',
        items: {
          vocabulary: { '@id': 'plone.app.vocabularies.UserFriendlyTypes' },
        },
        default: ['Event'],
      },
      relocation: {
        title: intl.formatMessage(messages.relocation),
        description: intl.formatMessage(messages.relocationDescription),
        default: '',
      },
    },
    required: [],
  };
};
