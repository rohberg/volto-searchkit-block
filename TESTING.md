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



Inspect container with 

    docker exec -it <container-id> bash


## TODO 

- Run celery


## OUTDATED

Run robot server:

    docker compose exec backend bin/robot-server rohberg.elasticsearchblocks.testing.ROHBERG_ELASTICSEARCHBLOCKS_FIXTURE

In general: Execute command on container with:

    docker compose exec backend  ls -la 

