import zoomSVG from '@plone/volto/icons/zoom.svg';
import { getQuerystring } from '@plone/volto/actions';

import {
  FacetedSearchBlockEdit,
  FacetedSearchBlockView,
  TestSearchkitQuerystrings,
} from './components';
import {
  ReferenceSearchBlockEdit,
  ReferenceSearchBlockView,
} from './components/Blocks/Reference';

import SearchSectionsWidget from './components/Blocks/SearchSectionsWidget';

const applyConfig = (config) => {
  config.settings.searchkitblock = {};
  config.settings.searchkitblock.trackVoltoMatomo = false;

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

  config.widgets.widget.searchsectionswidget = SearchSectionsWidget;

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

  // Fetch querystring indexes.
  // See /effective-volto/addons/asyncconnect
  config.settings.asyncPropsExtenders = [
    ...(config.settings.asyncPropsExtenders || []),
    {
      path: '',
      extend: (dispatchActions) => {
        const action = {
          key: 'querystringindexes',
          promise: ({ store }) => {
            const state = store.getState();
            if (state.querystring?.indexes?.Title) {
              return;
            }
            const action = getQuerystring();
            return store.dispatch(action).catch((e) => {
              console.error('fetch of getQuerystring failed');
            });
          },
        };
        return [...dispatchActions, action];
      },
    },
  ];

  return config;
};

export default applyConfig;
