import React from 'react';
import { useIntl } from 'react-intl';
import { SearchBlockSchema } from './schema';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';

const Sidebar = ({ data, block, onChangeBlock }) => {
  const intl = useIntl();
  let schema = SearchBlockSchema({ data, intl });
  return (
    <InlineForm
      schema={schema}
      title={schema.title}
      onChangeField={(id, value) => {
        onChangeBlock(block, {
          ...data,
          [id]: value,
        });
      }}
      formData={data}
    />
  );
};

export default Sidebar;
