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

PLONE_VERSION=6
DOCKER_IMAGE=plone/server-dev:${PLONE_VERSION}
# DOCKER_IMAGE_ACCEPTANCE=plone/server-acceptance:${PLONE_VERSION}
# TODO use build image with c.e.plone
DOCKER_IMAGE_ACCEPTANCE=plone/server-acceptance:${PLONE_VERSION}

ADDON_NAME='volto-searchkit-block'

.PHONY: help
help: ## Show this help
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"



###########################################
# Backend
###########################################
.PHONY: backend-install
backend-install:  ## Create virtualenv and install Plone
	$(MAKE) -C "./backend/" install
	$(MAKE) backend-create-site

.PHONY: backend-build
backend-build:  ## Build Backend
	$(MAKE) -C "./backend/" install

.PHONY: backend-create-site
backend-create-site: ## Create a Plone site with default content
	$(MAKE) -C "./backend/" create-site

.PHONY: backend-update-example-content
backend-update-example-content: ## Export example content inside package
	$(MAKE) -C "./backend/" update-example-content

.PHONY: backend-start
backend-start: ## Start Plone Backend
	$(MAKE) -C "./backend/" start

.PHONY: backend-test
backend-test:  ## Test backend codebase
	@echo "Test backend"
	$(MAKE) -C "./backend/" test

# .PHONY: install
# install:  ## Install
# 	@echo "Install Backend & Frontend"
# 	if [ -d $(GIT_FOLDER) ]; then $(PRE_COMMIT) install; else echo "$(RED) Not installing pre-commit$(RESET)";fi
# 	$(MAKE) backend-install
# 	$(MAKE) frontend-install

# .PHONY: start
# start:  ## Start
# 	@echo "Starting application"
# 	$(MAKE) backend-start
# 	$(MAKE) frontend-start

# .PHONY: clean
# clean:  ## Clean installation
# 	@echo "Clean installation"
# 	$(MAKE) -C "./backend/" clean
# 	$(MAKE) -C "./frontend/" clean

# .PHONY: check
# check:  ## Lint and Format codebase
# 	@echo "Lint and Format codebase"
# 	$(PRE_COMMIT) run -a


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

# .PHONY: backend-docker-start
# backend-docker-start:	## Starts a Docker-based backend for development
# 	@echo "$(GREEN)==> Start Docker-based Plone Backend$(RESET)"
# 	docker run -it --rm --name=backend -p 8080:8080 -e SITE=Plone $(DOCKER_IMAGE)

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
	ADDONS=testing-volto-searchkit-block:monolingualFixture RAZZLE_API_PATH=http://127.0.0.1:55001/plone pnpm start

.PHONY: acceptance-frontend-prod-start
acceptance-frontend-prod-start-monolingual: ## Start acceptance frontend in production mode
	ADDONS=testing-volto-searchkit-block:monolingualFixture RAZZLE_API_PATH=http://127.0.0.1:55001/plone pnpm build && pnpm start:prod

.PHONY: acceptance-backend-start-monolingual
acceptance-backend-start-monolingual: ## Start backend acceptance server
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
	ADDONS=testing-volto-searchkit-block:multilingualFixture RAZZLE_API_PATH=http://127.0.0.1:55001/plone pnpm start

.PHONY: acceptance-frontend-prod-start
acceptance-frontend-prod-start-multilingual: ## Start acceptance frontend in production mode
	ADDONS=testing-volto-searchkit-block:multilingualFixture RAZZLE_API_PATH=http://127.0.0.1:55001/plone pnpm build && pnpm start:prod

.PHONY: acceptance-backend-start-multilingual
acceptance-backend-start-multilingual: ## Start backend acceptance server
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

