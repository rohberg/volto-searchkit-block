import zoomSVG from '@plone/volto/icons/zoom.svg';

import {
  FacetedSearchBlockEdit,
  FacetedSearchBlockView,
  TestSearchkitQuerystrings,
} from './components';
import {
  ReferenceSearchBlockEdit,
  ReferenceSearchBlockView,
} from './components/Blocks/Reference';

const applyConfig = (config) => {
  config.settings.searchkitblock = {
    ...(config.settings.searchkitblock ?? {}),
    simpleFields: [
      'title^1.4',
      'description^1.2',
      'subjects^1.4',
      'blocks_plaintext',
    ],
    filterLayout: 'dropdown',
    trackVoltoMatomo: false,
  };

  config.blocks.blocksConfig.searchkitblock = {
    id: 'searchkitblock',
    title: 'Searchkit',
    edit: FacetedSearchBlockEdit,
    view: FacetedSearchBlockView,
    icon: zoomSVG,
    group: 'common',
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

  // Test some querystrings
  config.settings.controlpanels = [
    ...(config.settings.controlpanels || []),
    {
      '@id': '/test-searchkit-querystrings',
      group: 'Add-on Configuration',
      title: 'Test searchkit querystrings',
    },
  ];

  config.addonRoutes = [
    ...config.addonRoutes,
    {
      path: '/controlpanel/test-searchkit-querystrings',
      component: TestSearchkitQuerystrings,
    },
  ];

  return config;
};

export default applyConfig;
