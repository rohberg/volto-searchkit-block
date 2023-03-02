# Development

## Backend

    make dev-start-backend

## Elasticsearch

Run with Docker.

Change directory to ./development-searchkitblock/mac/ or ./development-searchkitblock/linux/ and run:

    docker compose up

Inspect with 

    docker exec -it <container-id> bash

## Redis

Start with

    redis-server /usr/local/etc/redis.conf

## Celery

Change directory to ./development-searchkitblock/celery and install:

Install with:

    python -m venv venv
    source venv/bin/activate
    pip install -U pip wheel mxdev
    mxdev -c mx.ini

    pip install -r requirements-mxdev.txt

Run with:

    source .env
    venv/bin/celery -A collective.elastic.ingest.celery.app worker -l info

    # or with more info:
    venv/bin/celery -A collective.elastic.ingest.celery.app worker -l debug


## Frontend

    make start-addon-testing-project
