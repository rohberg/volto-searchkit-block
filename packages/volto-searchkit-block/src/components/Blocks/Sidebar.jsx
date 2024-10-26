import React from 'react';
import { useIntl } from 'react-intl';
import { SearchBlockSchema } from './schema';
import { BlockDataForm } from '@plone/volto/components';

const Sidebar = ({ data, block, onChangeBlock }) => {
  const intl = useIntl();
  let schema = SearchBlockSchema({ data, intl });
  return (
    <BlockDataForm
      schema={schema}
      title={schema.title}
      onChangeField={(id, value) => {
        onChangeBlock(block, {
          ...data,
          [id]: value,
        });
      }}
      onChangeBlock={onChangeBlock}
      formData={data}
      block={block}
    />
  );
};

export default Sidebar;
