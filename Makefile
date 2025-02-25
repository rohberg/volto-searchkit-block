### Defensive settings for make:
#     https://tech.davis-hansson.com/p/make/
SHELL:=bash
.ONESHELL:
.SHELLFLAGS:=-eu -o pipefail -c
.SILENT:
.DELETE_ON_ERROR:
MAKEFLAGS+=--warn-undefined-variables
MAKEFLAGS+=--no-builtin-rules

CURRENT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

# Recipe snippets for reuse

# We like colors
# From: https://coderwall.com/p/izxssa/colored-makefile-for-golang-projects
RED=`tput setaf 1`
GREEN=`tput setaf 2`
RESET=`tput sgr0`
YELLOW=`tput setaf 3`

GIT_FOLDER=$(CURRENT_DIR)/.git
PRE_COMMIT=pipx run --spec 'pre-commit==3.7.1' pre-commit

ADDON_NAME='volto-searchkit-block'


.PHONY: help
help: ## Show this help
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"


###########################################
# dev backend
###########################################

.PHONY: dev-backend-install
dev-backend-install: ## Install Plone
	$(MAKE) -C "./backend/" install

.PHONY: dev-backend-start-monolingual
dev-backend-start-monolingual: ## Start Plone
	export INDEX_NAME=plone
	export INDEX_PASSWORD=paraDiesli,17
	$(MAKE) -C "./backend/" start

.PHONY: dev-backend-start-multilingual
dev-backend-start-multilingual: ## Start Plone
	export INDEX_NAME=multilingual
	export INDEX_PASSWORD=paraDiesli,17
	$(MAKE) -C "./backend/" start

# content
.PHONY: create-site-monolingual
create-site-monolingual: ## Create monolingual site
	export INDEX_NAME=plone
	export INDEX_PASSWORD=paraDiesli,17
	$(MAKE) -C "./backend/" create-site-monolingual

.PHONY: create-site-multilingual
create-site-multilingual: ## Create multilingual site
	export INDEX_NAME=multilingual
	export INDEX_PASSWORD=paraDiesli,17
	$(MAKE) -C "./backend/" create-site-multilingual

.PHONY: backend-update-example-content-monolingual
backend-update-example-content-monolingual: ## Export monolingual example content inside package
	$(MAKE) -C "./backend/" update-example-content-monolingual

.PHONY: backend-update-example-content-multilingual
backend-update-example-content-multilingual: ## Export multilingual example content inside package
	$(MAKE) -C "./backend/" update-example-content-multilingual

# Index server
.PHONY: dev-index-start-monolingual
dev-index-start-monolingual: ## Start index dev server monolingual
	export INDEX_PASSWORD=paraDiesli,17
	export PLONE_PASSWORD=admin
	export PLONE_SITE_PREFIX_PATH=Plone
	$(MAKE) -C "./backend/" dev-index-start-monolingual

.PHONY: dev-index-start-multilingual
dev-index-start-multilingual: ## Start index dev server multilingual
	export INDEX_PASSWORD=paraDiesli,17
	export PLONE_PASSWORD=admin
	export PLONE_SITE_PREFIX_PATH=Multilingual
	$(MAKE) -C "./backend/" dev-index-start-multilingual


###########################################
# Frontend
###########################################

.PHONY: install
install: ## Installs the add-on in a development environment
	@echo "$(GREEN)Install$(RESET)"
	if [ -d $(GIT_FOLDER) ]; then $(PRE_COMMIT) install; else echo "$(RED) Not installing pre-commit$(RESET)";fi
	pnpm dlx mrs-developer missdev --no-config --fetch-https
	pnpm i
	make build-deps

.PHONY: start
start: ## Starts Volto, allowing reloading of the add-on during development
	pnpm start

.PHONY: start-monolingual
start-monolingual: ## frontend with language 'de'
	ADDONS=testing-volto-searchkit-block:monolingualFixture pnpm start

.PHONY: start-multilingual
start-multilingual: ## frontend with language 'de' and multilingual
	ADDONS=testing-volto-searchkit-block:multilingualFixture RAZZLE_DEV_PROXY_API_PATH=http://127.0.0.1:8080/Multilingual pnpm start

.PHONY: start-with-bookmarks
start-with-bookmarks: ## frontend with addon `volto-bookmarks`
	ADDONS="@plone-collective/volto-bookmarks;testing-volto-searchkit-block:bookmarksFixture" pnpm start

.PHONY: build
build: ## Build a production bundle for distribution of the project with the add-on
	pnpm build

core/packages/registry/dist: $(shell find core/packages/registry/src -type f)
	pnpm --filter @plone/registry build

core/packages/components/dist: $(shell find core/packages/components/src -type f)
	pnpm --filter @plone/components build

.PHONY: build-deps
build-deps: core/packages/registry/dist core/packages/components/dist ## Build dependencies

.PHONY: i18n
i18n: ## Sync i18n
	pnpm --filter $(ADDON_NAME) i18n

.PHONY: ci-i18n
ci-i18n: ## Check if i18n is not synced
	pnpm --filter $(ADDON_NAME) i18n && git diff -G'^[^\"POT]' --exit-code

.PHONY: format
format: ## Format codebase
	pnpm prettier:fix
	pnpm lint:fix
	pnpm stylelint:fix

.PHONY: lint
lint: ## Lint, or catch and remove problems, in code base
	pnpm lint
	pnpm prettier
	pnpm stylelint --allow-empty-input

.PHONY: release
release: ## Release the add-on on npmjs.org
	pnpm release

.PHONY: release-dry-run
release-dry-run: ## Dry-run the release of the add-on on npmjs.org
	pnpm release

.PHONY: test
test: ## Run unit tests
	pnpm test

.PHONY: ci-test
ci-test: ## Run unit tests in CI
	# Unit Tests need the i18n to be built
	VOLTOCONFIG=$(pwd)/volto.config.js pnpm --filter @plone/volto i18n
	CI=1 RAZZLE_JEST_CONFIG=$(CURRENT_DIR)/jest-addon.config.js pnpm --filter @plone/volto test -- --passWithNoTests

## Storybook
.PHONY: storybook-start
storybook-start: ## Start Storybook server on port 6006
	@echo "$(GREEN)==> Start Storybook$(RESET)"
	pnpm run storybook

.PHONY: storybook-build
storybook-build: ## Build Storybook
	@echo "$(GREEN)==> Build Storybook$(RESET)"
	mkdir -p $(CURRENT_DIR)/.storybook-build
	pnpm run storybook-build -o $(CURRENT_DIR)/.storybook-build


###########################################
# Acceptance monolingual
###########################################
.PHONY: acceptance-frontend-dev-start
acceptance-frontend-dev-start-monolingual: ## Start acceptance frontend in development mode
	ADDONS="@plone-collective/volto-bookmarks;testing-volto-searchkit-block:monolingualFixture" RAZZLE_API_PATH=http://127.0.0.1:55001/plone pnpm start

.PHONY: acceptance-frontend-prod-start
acceptance-frontend-prod-start-monolingual: ## Start acceptance frontend in production mode
	ADDONS="@plone-collective/volto-bookmarks;testing-volto-searchkit-block:monolingualFixture" RAZZLE_API_PATH=http://127.0.0.1:55001/plone pnpm build && pnpm start:prod

.PHONY: acceptance-backend-start-monolingual
acceptance-backend-start-monolingual: ## Start backend acceptance server
	export INDEX_PASSWORD=paraDiesli,17
	export PLONE_PASSWORD=secret
	$(MAKE) -C "./backend/" acceptance-backend-start-monolingual

.PHONY: ci-acceptance-backend-start-monolingual
ci-acceptance-backend-start-monolingual: ## Start backend acceptance server in headless mode for CI
	$(MAKE) -C "./backend/" acceptance-backend-start-monolingual

.PHONY: acceptance-test-monolingual
acceptance-test-monolingual: ## Start Cypress in interactive mode
	pnpm --filter @plone/volto exec cypress open --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/monolingual.*.{js,jsx,ts,tsx}',screenshotsFolder=$(CURRENT_DIR)'/cypress/screenshots'

.PHONY: ci-acceptance-test-monolingual
ci-acceptance-test-monolingual: ## Run cypress tests in headless mode for CI
	pnpm --filter @plone/volto exec cypress run --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/monolingual.*.{js,jsx,ts,tsx}',screenshotsFolder=$(CURRENT_DIR)'/cypress/screenshots'


###########################################
# Acceptance multilingual
###########################################
.PHONY: acceptance-frontend-dev-start
acceptance-frontend-dev-start-multilingual: ## Start acceptance frontend in development mode
	ADDONS="@plone-collective/volto-bookmarks;testing-volto-searchkit-block:multilingualFixture" RAZZLE_API_PATH=http://127.0.0.1:55001/plone pnpm start

.PHONY: acceptance-frontend-prod-start
acceptance-frontend-prod-start-multilingual: ## Start acceptance frontend in production mode
	ADDONS="@plone-collective/volto-bookmarks;testing-volto-searchkit-block:multilingualFixture" RAZZLE_API_PATH=http://127.0.0.1:55001/plone pnpm build && pnpm start:prod

.PHONY: acceptance-backend-start-multilingual
acceptance-backend-start-multilingual: ## Start backend acceptance server
	export INDEX_PASSWORD=paraDiesli,17
	export PLONE_PASSWORD=secret
	$(MAKE) -C "./backend/" acceptance-backend-start-multilingual

.PHONY: ci-acceptance-backend-start-multilingual
ci-acceptance-backend-start-multilingual: ## Start backend acceptance server in headless mode for CI
	$(MAKE) -C "./backend/" acceptance-backend-start-multilingual

.PHONY: acceptance-test-multilingual
acceptance-test-multilingual: ## Start Cypress in interactive mode
	pnpm --filter @plone/volto exec cypress open --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/multilingual.*.{js,jsx,ts,tsx}',screenshotsFolder=$(CURRENT_DIR)'/cypress/screenshots'

.PHONY: ci-acceptance-test-multilingual
ci-acceptance-test-multilingual: ## Run cypress tests in headless mode for CI
	pnpm --filter @plone/volto exec cypress run --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/multilingual.*.{js,jsx,ts,tsx}',screenshotsFolder=$(CURRENT_DIR)'/cypress/screenshots'

