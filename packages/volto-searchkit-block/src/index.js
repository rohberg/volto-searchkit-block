import zoomSVG from '@plone/volto/icons/zoom.svg';
// import { getQuerystring } from '@plone/volto/actions/querystring/querystring';

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
import {
  FetchQuerystringIndexes,
  InitializeAtom,
} from './atoms/QuerystringIndexes';

const applyConfig = (config) => {
  config.settings.appExtras = [
    ...config.settings.appExtras,
    {
      match: '/',
      component: FetchQuerystringIndexes,
    },
    {
      match: '/',
      component: InitializeAtom,
    },
  ];

  // @eeacms/volto-matomo
  config.settings.searchkitblock = {
    trackVoltoMatomo: false,
    trackSiteSearchOptions: {
      category: 'Suche in Dokumentation', // optional
      // count: 4, // optional
      documentTitle: 'Suche in Dokumentation', // optional
      href: '/suche', // optional
      // customDimensions: [
      //   {
      //     id: 1,
      //     value: 'loggedIn',
      //   },
      // ], // optional
    },
  };

  config.blocks.blocksConfig.searchkitblock = {
    id: 'searchkitblock',
    title: 'Searchkit',
    edit: FacetedSearchBlockEdit,
    view: FacetedSearchBlockView,
    icon: zoomSVG,
    group: 'common',
    restricted: false,
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
  // Configure 'Test searchkit querystrings' controlpanel
  config.blocks.blocksConfig.searchkitblock.searchconfig = {
    searchedFields: [
      'title^1.4',
      'description^1.2',
      'blocks_plaintext',
      'subjects^1.2',
    ],
    facet_fields: [],
    allowed_content_types: ['Document', 'News Item', 'Event'],
    allowed_review_states: [],
    // backend_url: 'http://host.docker.internal:8080/Plone',
    // frontend_url: 'http://localhost:3000',
  };

  return config;
};

export default applyConfig;
