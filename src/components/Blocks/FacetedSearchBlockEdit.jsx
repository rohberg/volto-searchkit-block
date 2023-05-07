import React from 'react';
import { Container, Segment } from 'semantic-ui-react';
import { SidebarPortal } from '@plone/volto/components';

import Sidebar from './Sidebar';
import FacetedSearch from '../Views/FacetedSearch';
import DownloadFiltersMapping from './DownloadFiltersMapping';

const Edit = ({ data, onChangeBlock, block, selected }) => {
  return (
    <div className="block searchkitsearch">
      <SidebarPortal selected={selected}>
        <Sidebar data={data} block={block} onChangeBlock={onChangeBlock} />
        <Container>
          <Segment textAlign="center">
            <DownloadFiltersMapping data={data} />
          </Segment>
        </Container>
      </SidebarPortal>

      <div className="block searchkitsearch">
        <FacetedSearch data={data} />
      </div>
    </div>
  );
};

export default Edit;
