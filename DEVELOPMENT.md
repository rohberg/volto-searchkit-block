# Development

## Elasticsearch

Run with Docker.

Change directory to ./development-projectname and run:

    docker compose up

Inspect with 

    docker exec -it <container-id> bash

    docker compose exec elk more /etc/elasticsearch/elasticsearch.yml

## Redis

Start with

    redis-server /usr/local/etc/redis.conf

## Celery

TODO Celery

    cd ./api/
    source .env
    ./bin/celery -A collective.elastic.ingest.celery.app worker -l info

    # or with more info:
    ./bin/celery -A collective.elastic.ingest.celery.app worker -l debug

