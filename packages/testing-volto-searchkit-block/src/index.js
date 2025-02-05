import Bookmarking from '@plone-collective/volto-bookmarks/components/Bookmarking';
// import CustomResultsListItemWithBookmarks from './components/CustomResultsListItemWithBookmarks';

export const monolingualFixture = (config) => {
  config.settings.isMultilingual = false;
  config.settings.supportedLanguages = ['de'];
  config.settings.defaultLanguage = 'de';

  return config;
};

export const multilingualFixture = (config) => {
  config.settings.isMultilingual = true;
  config.settings.supportedLanguages = ['de', 'en'];
  config.settings.defaultLanguage = 'de';

  return config;
};

/**
 * Fixture for bookmarking with volto-bookmarks
 */
export const bookmarksFixture = (config) => {
  config.settings.appExtras = [
    ...config.settings.appExtras,
    {
      // match: '/news/',
      match: '/',
      component: Bookmarking,
    },
  ];

  config.settings.bookmarks.bookmarkgroupmapping = {
    ...config.settings.bookmarks.bookmarkgroupmapping,
    'News Item': 'Nachrichten',
    default_search: 'Suche',
    default_nogroup: 'Miscellaneous',
  };

  config.settings.bookmarks.filtermapping.facet_fields = {
    ...config.settings.bookmarks.filtermapping.facet_fields,
    'News Item': 'Typ Nachricht',
    Document: 'Typ Seite',
    published: 'veröffentlichte',
  };
  config.settings.bookmarks.filtermapping.search_sections = {
    ...config.settings.bookmarks.filtermapping.search_sections,
    nachrichten: 'Bereich Nachrichten',
    others: 'Nicht in ausgewählten Bereichen',
  };

  // Add bookmarking to the search block
  // by registering a custom component for the results list item
  // config.registerComponent({
  //   name: 'CustomResultsListItem',
  //   component: CustomResultsListItemWithBookmarks,
  // });

  return config;
};

const applyConfig = (config) => {
  return config;
};

export default applyConfig;
