import zoomSVG from '@plone/volto/icons/zoom.svg';

import { FacetedSearchBlockEdit, FacetedSearchBlockView } from './components';

const applyConfig = (config) => {
  config.settings.searchkitblock = {
    ...config.settings.searchkitblock,
    elasticurl: process.env.ELASTIC_URL || 'http://localhost:9200/esploneindex',
  };

  config.blocks.blocksConfig.searchkitblock = {
    id: 'searchkitblock',
    title: 'Search',
    edit: FacetedSearchBlockEdit,
    view: FacetedSearchBlockView,
    icon: zoomSVG,
    group: 'text',
    restricted: true,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  return config;
};

export default applyConfig;
