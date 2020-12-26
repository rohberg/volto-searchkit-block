# volto-searchkit-block
[![Releases](https://img.shields.io/github/v/release/rohberg/volto-searchkit-block)](https://github.com/rohberg/volto-searchkit-block/releases)

[Volto](https://github.com/plone/volto) add-on

## Features

###

Demo GIF

## Getting started

Your have ElasticSearch up and running with Plone. 

* Your ElasticSearch Server is available on 'myelasticsearch.acme.org'
* Your Index is 'plone2020'
* Check with https://myelasticsearch.acme.org/plone2020/_count
* CORS is configured: 

elasticsearch.yml

```
http.cors.enabled : true
http.cors.allow-origin : /https?:\/\/(.*)acme.org(.*)/
```
  

Start ElasticSearch with ELASTIC_URL=myelasticsearch.acme.org/plone2020 ./bin/elasticsearch


## Copyright and license

The Initial Owner of the Original Code is the Plone Foundation.
All Rights Reserved.

See [LICENSE.md](https://github.com/rohberg/volto-searchkit-block/blob/master/LICENSE.md) for details.
