# volto-searchkit-block


## Features

### Search

Highly overridable components for searching, filtering and displaying search results. Sometimes also called faceted navigation.

As this search is addressing `ElasticSearch` with Analysis, the search does understand flexation of words and tolerates typos by fuzzy searching.

Matched phrases are shown with matches highlighted.

Additional metadata per result item can be configured easily.

The block is prepared for Matomo analytics.


![Search @rohberg/volto-searchkit-block](public/search.png)

## Getting started

You have ElasticSearch up and running with Plone. See `collective.elastic.ingest` and `collective.elastic.ingest` how to set up.

For searching in blocks content, install `rohberg.elasticsearchblocks` and enable its behavior.


## Configuration

The block is not for editors. So please enable adding searchkitblock once by

```js
config.blocks.blocksConfig.searchkitblock.restricted = true;
```

and disable the block after adding it to a page of your choice.

The block can be configured by 

- searchable fields with boosting
- facets
- restricting types and states

![Configuration](public/configuration.png)

Enable Matomo tracking via

```js
  config.settings.searchkitblock = {
    ...config.settings.searchkitblock,
    trackVoltoMatomo: true,
  };
```

## panel for testing matches

/controlpanel/test-searchkit-querystrings

Please update the settings according to your deployment: /controlpanel/volto_searchkit_block_control_panel


## TODOs

### Restrict block creation to Site Admins.

In future, blocks creation can be restricted by permission / role. Then change attribute "restricted" to false. Until then: download add-on, change restricted to false, add block, switch back to restricted true.


## Credits

This package is a Plone Volto integration of react-searchkit https://www.npmjs.com/package/react-searchkit


## Copyright and license

The Initial Owner of the Original Code is Rohberg, Zürich.
All Rights Reserved.

See [LICENSE.md](https://github.com/rohberg/volto-searchkit-block/blob/master/LICENSE.md) for details.
