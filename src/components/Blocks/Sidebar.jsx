import React from 'react';
import { SearchBlockSchema } from './schema';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';

const Sidebar = ({ data, block, onChangeBlock }) => {
  return (
    <InlineForm
      schema={SearchBlockSchema}
      title={SearchBlockSchema.title}
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
