import Bookmarking from '@plone-collective/volto-bookmarks/components/Bookmarking';
import ListingVariationTemplateWithBookmarks from '@plone-collective/volto-bookmarks/components/ListingVariationTemplateWithBookmarks';
import CustomResultsListItemWithBookmarks from './components/CustomResultsListItemWithBookmarks';

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
    Nachricht: 'Gruppe Nachrichten',
    suchen: 'Suche', // id of search page
    'suchen-in-news': 'Suche in News',
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
  config.registerComponent({
    name: 'CustomResultsListItem',
    component: CustomResultsListItemWithBookmarks,
  });

  // Listing variation with one bookmark button per listing item
  config.blocks.blocksConfig.listing.variations.push({
    id: 'intranet1',
    title: 'Intranet 1',
    template: ListingVariationTemplateWithBookmarks,
  });

  return config;
};

const applyConfig = (config) => {
  return config;
};

export default applyConfig;
