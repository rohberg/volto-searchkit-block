import zoomSVG from '@plone/volto/icons/zoom.svg';

import { FacetedSearchBlockEdit, FacetedSearchBlockView } from './components';
import {
  ReferenceSearchBlockEdit,
  ReferenceSearchBlockView,
} from './components/Blocks/Reference';

const applyConfig = (config) => {
  config.settings.searchkitblock = {
    ...(config.settings.searchkitblock ?? {}),
    elasticurl: process.env.ELASTIC_URL || 'http://localhost:9200/esploneindex',
    filterLayout: 'dropdown',
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

  /**
   * A reference block with default components from react-searchkit
   * TODO set permission to restrict to admin as soon as addPermission is implemented in Volto. For now: set restricted to true.
   */
  config.blocks.blocksConfig.referencesearchkitblock = {
    id: 'referencesearchkitblock',
    title: 'Search Reference',
    edit: ReferenceSearchBlockEdit,
    view: ReferenceSearchBlockView,
    icon: zoomSVG,
    group: 'text',
    restricted: true,
    mostUsed: true,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  return config;
};

export default applyConfig;
