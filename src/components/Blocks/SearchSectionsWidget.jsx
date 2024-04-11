import React from 'react';
import { defineMessages } from 'react-intl';

import ObjectListWidget from '@plone/volto/components/manage/Widgets/ObjectListWidget';

const messages = defineMessages({
  searchSection: {
    id: 'Search section',
    defaultMessage: 'Search section',
  },
  searchSectionLabel: {
    id: 'Search section label',
    defaultMessage: 'Search section label',
  },
  addSearchSection: {
    id: 'Add search section',
    defaultMessage: 'Add search section',
  },
  showFilter: {
    id: 'Show filters',
    defaultMessage: 'Show filter',
  },
});

const ItemSchema = ({ intl }) => {
  return {
    title: intl.formatMessage(messages.searchSection),
    addMessage: intl.formatMessage(messages.addSearchSection),
    properties: {
      section: {
        title: intl.formatMessage(messages.searchSection),
      },
      label: {
        title: intl.formatMessage(messages.searchSectionLabel),
      },
      show_filter: {
        title: intl.formatMessage(messages.showFilter),
        type: 'boolean',
        default: true,
      },
    },
    fieldsets: [
      {
        id: 'default',
        title: 'History-Eintrag',
        fields: ['section', 'label', 'show_filter'],
      },
    ],
    required: [],
  };
};

const SearchSectionsWidget = (props) => {
  return (
    <ObjectListWidget
      schema={ItemSchema}
      {...props}
      value={props.value?.items || props.default?.items || []}
      onChange={(id, value) => props.onChange(id, { items: value })}
    />
  );
};

export default SearchSectionsWidget;
