import React from 'react';
import { SidebarPortal } from '@plone/volto/components';

import Sidebar from './Sidebar';
// import FacetedSearch from '../Views/FacetedSearch';

const Edit = ({ data, onChangeBlock, block, selected }) => {
  return (
    <div className="block searchkitsearch">
      <SidebarPortal selected={selected}>
        <Sidebar data={data} block={block} onChangeBlock={onChangeBlock} />
      </SidebarPortal>

      <p><b>Searchkit search. Voll elastisch.</b></p>
    </div>
  );
};

export default Edit;
