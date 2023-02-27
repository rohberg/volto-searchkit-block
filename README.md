# @rohberg/volto-searchkit-block


## Features

### Find

Search block with highly overridable components for searching, filtering and displaying search results. Sometimes also called faceted navigation.

As this search is addressing `ElasticSearch` with text analysis, the search does understand inflection of words and tolerates typos by fuzzy searching.

Matched phrases are shown with highlighted matches.

Additional metadata per result item can be configured easily.
Meta data values are clickable to find related content.

The block is prepared for Matomo analytics.

![Search @rohberg/volto-searchkit-block](public/search.png)


## Getting started

You have ElasticSearch up and running with Plone. See [`collective.elastic.plone`](https://github.com/collective/collective.elastic.plone) and [`collective.elastic.ingest`](https://github.com/collective/collective.elastic.ingest) how to set up.

For searching in blocks content, install [`rohberg.elasticsearchblocks`](https://github.com/rohberg/rohberg.elasticsearchblocks) and enable its behavior on your content types.


## Configuration

The block is not for editors. So please enable adding a searchkit block once by

```js
config.blocks.blocksConfig.searchkitblock.restricted = true;
```

and disable the block after adding it to a page of your choice.

The block can be configured by 

- searchable fields with boosting
- facets
- restricting types and states
- results meta data

![Configuration](public/configuration.png)


Enable Matomo tracking via

```js
  config.settings.searchkitblock.trackVoltoMatomo = true
```


## Panel for testing matches

`/controlpanel/test-searchkit-querystrings`

Please update the settings according to your deployment: `/controlpanel/volto_searchkit_block_control_panel`


## Credits

This package is a Plone Volto integration of react-searchkit https://www.npmjs.com/package/react-searchkit Copyright (C) 2015-2019 CERN.


## Copyright and license

Copyright (C) 2022 Rohberg.

The project is licensed.
See [LICENSE](https://github.com/rohberg/volto-searchkit-block/blob/master/LICENSE) for details.
