# Searchkit Block (@rohberg/volto-searchkit-block)

Searching with OpenSearch

[![npm](https://img.shields.io/npm/v/@rohberg/volto-searchkit-block)](https://www.npmjs.com/package/@rohberg/volto-searchkit-block)
[![Acceptance tests multilingual](https://github.com/rohberg/volto-searchkit-block/actions/workflows/acceptance_multilingual.yml/badge.svg)](https://github.com/rohberg/volto-searchkit-block/actions/workflows/acceptance_multilingual.yml)
[![Acceptance tests monolingual](https://github.com/rohberg/volto-searchkit-block/actions/workflows/acceptance_monolingual.yml/badge.svg)](https://github.com/rohberg/volto-searchkit-block/actions/workflows/acceptance_monolingual.yml)
[![Unit tests](https://github.com/rohberg/volto-searchkit-block/actions/workflows/unit.yml/badge.svg)](https://github.com/rohberg/volto-searchkit-block/actions/workflows/unit.yml)
[![Code analysis checks](https://github.com/rohberg/volto-searchkit-block/actions/workflows/code.yml/badge.svg)](https://github.com/rohberg/volto-searchkit-block/actions/workflows/code.yml)

## Features

<!-- TODO README
- user instruction how to search
- backend instructions
- …
 -->

Search block with highly overridable components for searching, filtering and displaying search results. Sometimes also called faceted navigation.

As this search is addressing `OpenSearch/ElasticSearch` with text analysis, the search does understand inflection of words, tolerates typos by fuzzy searching, allows exact search and wildcard search.
See [User documentation](#user-documentation) on how to search.

Matched phrases are shown with highlighted matches.

Additional metadata per result item can be configured easily.
Meta data values are clickable to find related content.

The block is prepared for Matomo analytics.

![Search @rohberg/volto-searchkit-block](public/search.png)

## Installation

To install your project, you must choose the method appropriate to your version of Volto.


### Volto 17 and earlier

Create a new Volto project (you can skip this step if you already have one):

```
npm install -g yo @plone/generator-volto
yo @plone/volto my-volto-project --addon volto-searchkit-block
cd my-volto-project
```

Add `volto-searchkit-block` to your package.json:

```JSON
"addons": [
    "volto-searchkit-block"
],

"dependencies": {
    "volto-searchkit-block": "*"
}
```

Download and install the new add-on by running:

```
yarn install
```

Start volto with:

```
yarn start
```

### Volto 18 and later

Add `volto-searchkit-block` to your `package.json`:

```json
"dependencies": {
    "volto-searchkit-block": "*"
}
```

Add `volto-searchkit-block` to your `volto.config.js`:

```javascript
const addons = ['volto-searchkit-block'];
```

## Test installation

Visit http://localhost:3000/ in a browser, login, and check the awesome new features.


## Development

The development of this add-on is done in isolation using a new approach using pnpm workspaces and latest `mrs-developer` and other Volto core improvements.
For this reason, it only works with pnpm and Volto 18 (currently in alpha).


### Pre-requisites

-   [Node.js](https://6.docs.plone.org/install/create-project.html#node-js)
-   [Make](https://6.docs.plone.org/install/create-project.html#make)
-   [Docker](https://6.docs.plone.org/install/create-project.html#docker)


### Make convenience commands

Run `make help` to list the available commands.

```text
help                                          Show this help
dev-backend-start-monolingual                 Start backend dev server
dev-backend-start-multilingual                Start backend dev server
install                                       Installs the add-on in a development environment
start                                         Starts Volto, allowing reloading of the add-on during development
build                                         Build a production bundle for distribution of the project with the add-on
build-deps                                    Build dependencies
i18n                                          Sync i18n
ci-i18n                                       Check if i18n is not synced
format                                        Format codebase
lint                                          Lint, or catch and remove problems, in code base
release                                       Release the add-on on npmjs.org
release-dry-run                               Dry-run the release of the add-on on npmjs.org
test                                          Run unit tests
ci-test                                       Run unit tests in CI
storybook-start                               Start Storybook server on port 6006
storybook-build                               Build Storybook
acceptance-frontend-dev-start-monolingual     Start acceptance frontend in development mode
acceptance-frontend-prod-start-monolingual    Start acceptance frontend in production mode
acceptance-backend-start-monolingual          Start backend acceptance server
ci-acceptance-backend-start-monolingual       Start backend acceptance server in headless mode for CI
acceptance-test-monolingual                   Start Cypress in interactive mode
ci-acceptance-test-monolingual                Run cypress tests in headless mode for CI
acceptance-frontend-dev-start-multilingual    Start acceptance frontend in development mode
acceptance-frontend-prod-start-multilingual   Start acceptance frontend in production mode
acceptance-backend-start-multilingual         Start backend acceptance server
ci-acceptance-backend-start-multilingual      Start backend acceptance server in headless mode for CI
acceptance-test-multilingual                  Start Cypress in interactive mode
ci-acceptance-test-multilingual               Run cypress tests in headless mode for CI
```

### Development environment set up

TODO Development environment set up. backend, frontend

Install package requirements.

```shell
make install
```

### Start developing

Start the backend.

```shell
make backend-docker-start
```

In a separate terminal session, start the frontend.

```shell
make start
```

### Lint code

Run ESlint, Prettier, and Stylelint in analyze mode.

```shell
make lint
```

### Format code

Run ESlint, Prettier, and Stylelint in fix mode.

```shell
make format
```

### i18n

Extract the i18n messages to locales.

```shell
make i18n
```

### Unit tests

Run unit tests.

```shell
make test
```

### Run Cypress tests

Run each of these steps in separate terminal sessions.

In the first session, start the frontend in development mode.

```shell
make acceptance-frontend-dev-start-monolingual
```

In the second session, start the backend acceptance server.

```shell
make acceptance-backend-start-monolingual
```

In the third session, start the Cypress interactive test runner.

```shell
make acceptance-test-monolingual
```

Appropriate make commands for **multilingual** Cypress tests are available.

## License

The project is licensed under the MIT license.

## Credits and Acknowledgements 🙏

Crafted with care by **Generated using [Cookieplone (0.7.1)](https://github.com/plone/cookieplone) and [cookiecutter-plone (6f17615)](https://github.com/plone/cookiecutter-plone/commit/6f1761520019010ae3799dfa0c6b999b533d59a7) on 2024-10-26 13:17:25.419878**. A special thanks to all contributors and supporters!
