import React from 'react';
import { defineMessages } from 'react-intl';

import ObjectListWidget from '@plone/volto/components/manage/Widgets/ObjectListWidget';

const messages = defineMessages({
  searchsection: {
    id: 'Search section',
    defaultMessage: 'Search section',
  },
  searchsectionlabel: {
    id: 'Search section label',
    defaultMessage: 'Search section label',
  },
  searchSection: {
    id: 'Search section',
    defaultMessage: 'Search section',
  },
  addSearchSection: {
    id: 'Add search section',
    defaultMessage: 'Add search section',
  },
  showFilter: {
    id: 'Show filters',
    defineMessage: 'Show filter',
  },
});

const ItemSchema = ({ intl }) => {
  return {
    title: intl.formatMessage(messages.searchSection),
    addMessage: intl.formatMessage(messages.addSearchSection),
    properties: {
      section: {
        title: intl.formatMessage(messages.searchsection),
      },
      label: {
        title: intl.formatMessage(messages.searchsectionlabel),
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

// TODO defaultData
const SearchSectionsWidget = (props) => {
  // TODO intl
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
