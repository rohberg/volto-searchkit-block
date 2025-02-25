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

// DEBUG
import ListingVariationTemplateWithBookmarks from './components/Views/ListingVariationTemplateWithBookmarks';

const applyConfig = (config) => {
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

  // Fetch querystring indexes.
  // See /effective-volto/addons/asyncconnect
  config.settings.asyncPropsExtenders = [
    ...(config.settings.asyncPropsExtenders || []),
    {
      path: '/',
      extend: (dispatchActions) => {
        const action = {
          key: 'querystringindexes',
          promise: ({ store }) => {
            const state = store.getState();
            if (state.querystring?.indexes?.Title) {
              return;
            }
            const myaction = getQuerystring();
            return store.dispatch(myaction).catch((e) => {
              // eslint-disable-next-line no-console
              console.error('Fetch of getQuerystring failed');
            });
          },
        };
        return [...dispatchActions, action];
      },
    },
  ];

  // DEBUG Testing bookmarks in search/listing block
  // Variation with one bookmark button per listing item
  config.blocks.blocksConfig.listing.variations.push({
    id: 'intranet1',
    title: 'Intranet 1',
    template: ListingVariationTemplateWithBookmarks,
  });

  return config;
};

export default applyConfig;
