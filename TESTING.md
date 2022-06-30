# Testing


## Acceptance tests
- redis
- elasticsearch
- celery
- backend
- frontend
- cypress


In general: Execute command on container with:

    docker compose exec backend  ls -la 


Run celery:

TODO Run celery

Run acceptance backend instance:

    docker compose exec backend ./bin/robot-server plone.app.robotframework.testing.VOLTO_ROBOT_TESTING

