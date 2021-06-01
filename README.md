# volto-searchkit-block

[Volto](https://github.com/plone/volto) add-on

This package is a Plone Volto integration of react-searchkit https://www.npmjs.com/package/react-searchkit

## Features

### Search

Highly overridable components for searching, filtering and displaying search results.


![Search @rohberg/volto-searchkit-block](https://github.com/rohberg/volto-searchkit-block/raw/master/public/search.png)

## Getting started

You have ElasticSearch up and running with Plone. 

* Your ElasticSearch Server is available on 'myelasticsearch.acme.org'
* Your Index is 'esploneindex'
* Check with https://myelasticsearch.acme.org/esploneindex/_count
* CORS is configured: 

elasticsearch.yml

```
http.cors.enabled : true
http.cors.allow-origin : /https?:\/\/(.*)acme.org(.*)/
```
  

Start ElasticSearch with ELASTIC_URL=myelasticsearch.acme.org/esploneindex ./bin/elasticsearch



## Configuration

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

## TODOs

### Configurable filters

Configure which filters should be available.

### Restrict block creation to Site Admins.

In future blocks creation can be restricted by permission / role. Then change attribute "restricted" to false. Until then: download add-on, change restricted to false, add block, switch back to restricted true.

## Credits

This package is a Plone Volto integration of react-searchkit https://www.npmjs.com/package/react-searchkit


## Copyright and license

The Initial Owner of the Original Code is Rohberg, Zürich.
All Rights Reserved.

See [LICENSE.md](https://github.com/rohberg/volto-searchkit-block/blob/master/LICENSE.md) for details.
