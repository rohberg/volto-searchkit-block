# Testing


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

Run celery:

    docker compose exec backend bin/celery -A collective.elastic.ingest.celery.app multi restart workersearchkitblock --logfile="/app/celery/celery%n%I.log" --pidfile="/app/celery/celery%n.pid"

In general: Execute command on container with:

    docker compose exec backend  ls -la 

Inspect container with 

    docker exec -it <container-id> bash

