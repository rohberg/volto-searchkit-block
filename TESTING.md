# Testing

## Build and run acceptance tests

Build acceptance server:

    make build-acceptance 

Start acceptance server:

    make start-acceptance 

Then robot server runs on http://localhost:55001/plone

Run cypress acceptance tests:

    make test-acceptance


## Further topics

In general: Execute command on container with:

    docker compose exec backend  ls -la 

Inspect container with 

    docker exec -it <container-id> bash

