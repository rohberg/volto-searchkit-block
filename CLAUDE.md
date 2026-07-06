# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@rohberg/volto-searchkit-block` is a Volto (Plone frontend) add-on that provides a faceted search block backed by OpenSearch/ElasticSearch, using `react-searchkit`. This repo is the **development shell** for the add-on: the actual published package lives in `packages/volto-searchkit-block`, and the rest of the repo (Volto core checkout, backend, index server, test fixtures, Cypress suite) exists to develop and test it in isolation.

The add-on is developed against a full Volto core checkout pulled into `core/` via `mrs-developer` (see `mrs.developer.json`, pinned to a Volto tag) and wired together with pnpm workspaces (`pnpm-workspace.yaml`). Root `package.json` (`volto-searchkit-block-dev`) scripts mostly delegate into `core/` via `pnpm --filter @plone/volto ...` with `VOLTOCONFIG=volto.config.js` pointing Volto at this add-on.

## Repository layout

- `packages/volto-searchkit-block` — the actual add-on source (published to npm). `src/index.js` is the Volto `applyConfig` entry point registering blocks, widgets, and controlpanel routes.
- `packages/testing-volto-searchkit-block` — Volto add-on providing test fixtures/content profiles (`monolingualFixture`, `multilingualFixture`) used only for dev/acceptance runs, not published as the main package.
- `packages/testing-volto-bookmarks` — a second test add-on demonstrating/exercising integration (bookmarking search results), also dev/acceptance-only.
- `core/` — full Volto core checkout (via mrs-developer), including `core/packages/registry` and `core/packages/components`, which the add-on depends on as workspace packages and which must be built before `start`/`test` (see `make build-deps`).
- `backend/` — Plone backend built with `mxdev`/`mx.ini`/`cookiecutter-zope-instance`, relies on the `collective.elastic.plone` add-on for indexing content into and querying OpenSearch/ElasticSearch. Contains dev and acceptance Docker Compose files, backend scripts (`create_site.py`, `reindex_site.py`), and OpenSearch ingest/analysis configuration under `backend/opensearch`.
- `cypress/` — acceptance tests, split by `monolingual`/`multilingual` spec naming convention (`cypress/tests/{monolingual,multilingual}/*.cy.js`), run against separate dockerized backend+index stacks.
- `docs/source` — Sphinx-ish docs, notably `configuration_index_server.md` covering compound-word handling configuration for the index server.
- `examples/opensearch/indexserver` — example index server setup meant to be copied into consuming projects (see README "Installation" section).

## Common commands

All commands are run from the repo root via `make` (run `make help` to list them); most delegate to `pnpm --filter` calls or into `backend/Makefile`.

### Setup
```shell
make dev-backend-install   # install Plone backend (mxdev/uv)
make install                # mrs-developer fetch + pnpm install + build-deps (registry/components)
```

### Running services (use three separate terminals, all from repo root)
```shell
make dev-index-start-monolingual      # or dev-index-start-multilingual — OpenSearch/ingest via docker compose
make dev-backend-start-monolingual    # or dev-backend-start-multilingual — Plone instance on :8080
make create-site-monolingual          # or create-site-multilingual — create a fresh Plone site with test content
make start-monolingual                # or start-multilingual — Volto frontend, with test fixture add-ons enabled
```
`start-monolingual`/`start-multilingual` set `ADDONS=` to enable `testing-volto-bookmarks` and `testing-volto-searchkit-block` fixture profiles; plain `make start` runs without fixtures.

### Lint / format / i18n
```shell
make lint     # eslint (--max-warnings=0), prettier --check, stylelint
make format   # eslint --fix, prettier --write, stylelint --fix
make i18n     # regenerate i18n messages for the add-on + Volto core
```

### Unit tests
```shell
make test      # jest via `pnpm --filter @plone/volto test`, using jest-addon.config.js
make ci-test    # same, but rebuilds i18n first (tests can depend on locale files existing)
```
To run a single test file, use the underlying pnpm/jest invocation directly, e.g.:
```shell
RAZZLE_JEST_CONFIG=$(pwd)/jest-addon.config.js pnpm --filter @plone/volto test -- packages/volto-searchkit-block/src/components/helpers.test.js
```

### Acceptance tests (Cypress)
Each of these three steps runs in its own terminal:
```shell
make acceptance-frontend-dev-start-monolingual   # Volto in dev mode, pointed at :55001 backend
make acceptance-backend-start-monolingual        # dockerized backend + OpenSearch acceptance stack
make acceptance-test-monolingual                 # Cypress interactive runner (spec pattern: cypress/tests/**/monolingual.*.cy.js)
```
Headless/CI equivalents: `ci-acceptance-backend-start-monolingual`, `ci-acceptance-test-monolingual` (and `acceptance-frontend-prod-start-monolingual` for a production build instead of dev mode). Swap `monolingual` → `multilingual` for the multilingual variants; the spec pattern and Docker Compose profile differ accordingly.

### Release
Releases are per-package, driven by `release-it` + `towncrier` inside `packages/volto-searchkit-block`:
```shell
make release            # pnpm --filter volto-searchkit-block release
make release-dry-run
```
Add changelog fragments as files under `packages/volto-searchkit-block/news/<issue-or-pr>.<type>` where type is one of `breaking`, `feature`, `bugfix`, `internal`, `documentation` (see `towncrier.toml`). On release, `release-it` builds the changelog, copies it and the root README to the package, and syncs the version into root `package.json`.

## Architecture of the add-on itself

- **Block registration** (`packages/volto-searchkit-block/src/index.js`): registers two blocks — `searchkitblock` (`FacetedSearchBlockEdit`/`View`) and `referencesearchkitblock` (a restricted reference-search variant using default `react-searchkit` components), a `searchsectionswidget` widget, and a `/controlpanel/test-searchkit-querystrings` dev route/panel (`TestSearchkitQuerystrings`) for testing query strings against the backend. `config.blocks.blocksConfig.searchkitblock.searchconfig` holds the default search config (`searchedFields` with boost factors, `facet_fields`, `allowed_content_types`, `allowed_review_states`).
- **Search request flow** (`src/components/Searchkit/`):
  - `ESSearchApi.jsx` (`PloneSearchApi`) is the `react-searchkit` API adapter. It serializes UI query state via `CustomESRequestSerializer`, POSTs it to the Plone backend endpoint configured via `fetchPayload.url` (the backend, via `collective.elastic.plone`, forwards the raw ES/OpenSearch payload to the index server), then deserializes the response via `CustomESResponseSerializer`.
  - On a backend `NotFoundError` (index missing/stale), it calls `@@clear-and-update-index-server-index` on the backend and retries the search after a delay — this masks the "index not yet built" state on first use (see the README note about ignoring the initial `Reindexing ... failed` error).
  - `CustomESRequestSerializer`/`CustomESResponseSerializer` are the request/response translation layer between `react-searchkit`'s generic query state and this backend's ES/OpenSearch query DSL — read both together when changing query behavior or facet/highlight handling.
- **Views** (`src/components/Views/FacetedSearch.jsx`) assembles the actual `react-searchkit` `SearchkitProvider`/layout from the block's `data`/`searchconfig`; `ExtraInfo.jsx` renders configurable per-result metadata.
- **Matomo tracking**: the block dispatches a `searchkitQueryChanged` window event on every query change (not itself dependent on Matomo); consuming projects wire this to `@eeacms/volto-matomo` via `config.settings.appExtras` (see README "Tracking search with Matomo"). `config.settings.searchkitblock.trackVoltoMatomo`/`trackSiteSearchOptions` in `src/index.js` configure this.
- **Reference search block** (`src/components/Blocks/Reference/`) is a separate, restricted block for admin-configured reference searches, sharing the same `PloneSearchApi`/serializer stack.

## Search syntax supported by the block (user-facing, relevant when changing query serialization)

- Fuzzy by default (typo-tolerant, inflection-aware).
- `+term` forces a match, `-term` excludes it.
- Wildcards are supported.
- `"exact phrase"` for exact matches.
- Hyphenated words are indexed/searchable both as the whole compound and as split parts (e.g. `LSR-Lehrbetrieb` matches `LSR`); see `docs/source/configuration_index_server.md` and `backend/opensearch/opensearch-configuration` (dictionary decompounder / keyword marker token filters) for the index-side implementation.
- Multiple search terms are OR'd (results need at least one match).

## Backend/index-server notes

- The backend depends on `collective.elastic.plone[redis,opensearch]` for indexing (via Celery/Redis) and secure querying; it must be installed as a Python package, added to `instance.yaml`, and included as an add-on dependency.
- Environment variables (`backend/.env`, `backend/.dev-env`) configure `INDEX_SERVER`, `INDEX_USE_SSL`, `INDEX_OPENSEARCH`, `INDEX_LOGIN`/`INDEX_PASSWORD`, `CELERY_BROKER`, `PLONE_USER`/`PLONE_PASSWORD`.
- `backend/opensearch/ingest-configuration` (`mappings.json`, `analysis.json`, `preprocessings.json`) and `backend/opensearch/opensearch-configuration` (lexicon/keyword files) define the actual index schema and text analysis (compound word handling, keyword extraction) — changes to search behavior often require touching these alongside the frontend serializers.
