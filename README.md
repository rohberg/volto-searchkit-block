# volto-searchkit-block

[Volto](https://github.com/plone/volto) add-on

This package is a Plone Volto integration of react-searchkit https://www.npmjs.com/package/react-searchkit

## Features

### Search

Highly overridable components for searching, filtering and displaying search results. Sometimes also called faceted navigation.


![Search @rohberg/volto-searchkit-block](https://github.com/rohberg/volto-searchkit-block/raw/master/public/search.png)

## Getting started

You have ElasticSearch up and running with Plone. 

* Your ElasticSearch Server is available on 'myelasticsearch.acme.org'
* Your Index is 'esploneindex'
* You use an analyzer
* You have extra exact fields for exact search ("Basel")
* Check with https://myelasticsearch.acme.org/esploneindex/_count
* CORS is configured: 

elasticsearch.yml

```
http.cors.enabled : true
http.cors.allow-origin : /https?:\/\/(.*)acme.org(.*)/
```
  

Start ElasticSearch with ELASTIC_URL=myelasticsearch.acme.org/esploneindex ./bin/elasticsearch



## Configuration

The block is not for editors. So please enable adding searchkitblock once by

```js
config.blocks.blocksConfig.searchkitblock.restricted = true;
```

and disable the block after adding it to a page of your choice.

The block can be configured by 

- url of elastic search server
- relocation of the search bar

![Configuration](https://github.com/rohberg/volto-searchkit-block/raw/master/public/configuration.png)

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

### Request to Elasticsearch via Plone for security check

backend add-on with endpoint:

- Post service with argument: json (with aggs, post_filter)
- Request elasticsearch
- Filter search results by "View" permission
  https://6.dev-docs.plone.org/plone.api/user.html?highlight=has_permission#check-user-permission


### Configurable filters, etc

- which filters should be available.
- portal types
- workflow states

### Restrict block creation to Site Admins.

In future blocks creation can be restricted by permission / role. Then change attribute "restricted" to false. Until then: download add-on, change restricted to false, add block, switch back to restricted true.


## Credits

This package is a Plone Volto integration of react-searchkit https://www.npmjs.com/package/react-searchkit


## Copyright and license

The Initial Owner of the Original Code is Rohberg, Zürich.
All Rights Reserved.

See [LICENSE.md](https://github.com/rohberg/volto-searchkit-block/blob/master/LICENSE.md) for details.
