# Testing

## TODO

- View of Plone 'Document'
- On save of Plone content, the elasticsearch index is updated: redis, celery, do their job. Check ports!

## Acceptance tests
- redis
- elasticsearch
- celery
- backend
- frontend
- cypress

Run acceptance backend instance:

    docker compose up

Run robot server:

    docker compose exec plone ./bin/robot-server plone.app.robotframework.testing.VOLTO_ROBOT_TESTING

Then robot server runs on http://localhost:55001/plone

Run celery:

    docker compose exec backend bin/celery -A collective.elastic.ingest.celery.app multi restart workersearchkitblock --logfile="/app/celery/celery%n%I.log" --pidfile="/app/celery/celery%n.pid"

In general: Execute command on container with:

    docker compose exec backend  ls -la 

Inspect container with 

    docker exec -it <container-id> bash

