import React from 'react';
import { defineMessages } from 'react-intl';

import ObjectListWidget from '@plone/volto/components/manage/Widgets/ObjectListWidget';

import messages from '../../messages';

const ItemSchema = ({ intl }) => {
  return {
    title: intl.formatMessage(messages.searchSection),
    addMessage: intl.formatMessage(messages.add, {
      type: intl.formatMessage(messages.searchSection),
    }),
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
