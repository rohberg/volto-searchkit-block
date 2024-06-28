### Defensive settings for make:
#     https://tech.davis-hansson.com/p/make/
SHELL:=bash
.ONESHELL:
.SHELLFLAGS:=-eu -o pipefail -c
.SILENT:
.DELETE_ON_ERROR:
MAKEFLAGS+=--warn-undefined-variables
MAKEFLAGS+=--no-builtin-rules

include variables.mk

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


BACKEND_ADDONS='collective.elastic.plone ${KGS} $(TESTING_ADDONS)'
DEV_COMPOSE=dockerfiles/docker-compose.yml
ACCEPTANCE_COMPOSE=acceptance/docker-compose.yml
CMD_ENVS=CURRENT_DIR=${CURRENT_DIR} ADDON_NAME=${ADDON_NAME} ADDON_PATH=${ADDON_PATH} VOLTO_VERSION=${VOLTO_VERSION} PLONE_VERSION=${PLONE_VERSION} BACKEND_ADDONS=${BACKEND_ADDONS}
CMD=${CMD_ENVS} docker compose
PROJECT_NAME=${ADDON_PATH}
DOCKER_COMPOSE=${CMD} -p ${PROJECT_NAME} -f ${DEV_COMPOSE}
ACCEPTANCE=${CMD} -p ${PROJECT_NAME}-acceptance -f ${ACCEPTANCE_COMPOSE}
ACCEPTANCE_MULTILINGUAL=${CMD} -p ${PROJECT_NAME}-acceptance-multilingual -f ${ACCEPTANCE_COMPOSE}


.PHONY: all
all: help

.PHONY: help
help: ## Show this help
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

# Dev Helpers

.PHONY: install
install: ## Installs the add-on in a development environment
	@echo "$(GREEN)Install$(RESET)"
	# if [ -d $(GIT_FOLDER) ]; then $(PRE_COMMIT) install; else echo "$(RED) Not installing pre-commit$(RESET)";fi
	pnpm dlx mrs-developer missdev --no-config --fetch-https
	pnpm i
	pnpm build:deps

.PHONY: start
start: ## Starts Volto, allowing reloading of the add-on during development
	pnpm start

.PHONY: build
build: ## Build a production bundle for distribution of the project with the add-on
	pnpm build

core/packages/registry/dist: core/packages/registry/src
	pnpm --filter @plone/registry build

core/packages/components/dist: core/packages/components/src
	pnpm --filter @plone/components build

.PHONY: build-deps
build-deps: core/packages/registry/dist core/packages/components/dist ## Build dependencies

.PHONY: clean
clean:
	rm -rf ./core
	find ./ -name node_modules -exec rm -rf {} \;
	find ./ -name build -exec rm -rf {} \;
	find ./ -name cache -exec rm -rf {} \;

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

.PHONY: test-ci
ci-test: ## Run unit tests in CI
	CI=1 RAZZLE_JEST_CONFIG=$(CURRENT_DIR)/jest-addon.config.js pnpm --filter @plone/volto test -- --passWithNoTests


# Development

.PHONY: build-backend
build-backend: ## Build
	@echo "$(GREEN)==> Build Backend Container $(RESET)"
	${DOCKER_COMPOSE} build backend

.PHONY: start-backend
start-backend: ## Starts Docker backend
	@echo "$(GREEN)==> Start Docker-based Plone Backend $(RESET)"
	${DOCKER_COMPOSE} up backend -d

.PHONY: stop-backend
stop-backend: ## Stop Docker backend
	@echo "$(GREEN)==> Stop Docker-based Plone Backend $(RESET)"
	${DOCKER_COMPOSE} stop backend

.PHONY: build-addon
build-addon: ## Build Addon dev
	@echo "$(GREEN)==> Build Addon development container $(RESET)"
	${DOCKER_COMPOSE} build addon-dev

.PHONY: start-addon
start-addon: ## Starts Dev container
	@echo "$(GREEN)==> Start Addon Development container $(RESET)"
	${DOCKER_COMPOSE} up addon-dev

# TODO Check if 'make dev' is OK for trying the searchkit block
# TODO Add example content: plone.exportimport https://plone.github.io/plone.exportimport/features.html#plone-importer
.PHONY: dev
dev: ## Build and start development/demo environment
	@echo "$(GREEN)==> Build and start development environment $(RESET)"
	${DOCKER_COMPOSE} --profile dev build
	${DOCKER_COMPOSE} --profile dev up

.PHONY: dev-start
dev-start: ## Start development/demo environment without rebuilding images
	@echo "$(GREEN)==> Start development environment without rebuilding images $(RESET)"
	${DOCKER_COMPOSE} --profile dev up


# Opensearch and ingest containers (everything but backend and frontend)
.PHONY: opensearchandingest-build
opensearchandingest-build: ## Build containers for opensearch and ingest `make opensearchandingest-build PROJECT_NAME=foo`
	@echo "$(GREEN)==> Build containers for opensearch and ingest $(RESET)"
	${DOCKER_COMPOSE} --profile opensearchandingest build
	@echo "$(GREEN)==> Successfully build containers for opensearch and ingest $(RESET)"
	${DOCKER_COMPOSE} --profile opensearchandingest config

.PHONY: opensearchandingest-up
opensearchandingest-up: ## Start containers for opensearch and ingest. `make opensearchandingest-up PROJECT_NAME=foo`
	@echo "$(GREEN)==> Start containers for opensearch and ingest $(RESET)"
	${DOCKER_COMPOSE} --profile opensearchandingest up




# Acceptance monolingual
.PHONY: acceptance-frontend-dev-start
acceptance-frontend-dev-start: ## Start acceptance frontend in development mode
	SEARCHKITBLOCK_TESTING_LANGUAGESETTINGS=monolingual RAZZLE_API_PATH=http://localhost:55001/plone pnpm start

.PHONY: acceptance-frontend-prod-start
acceptance-frontend-prod-start: ## Start acceptance frontend in production mode
	SEARCHKITBLOCK_TESTING_LANGUAGESETTINGS=monolingual RAZZLE_API_PATH=http://localhost:55001/plone pnpm build && pnpm start:prod

.PHONY: acceptance-build
acceptance-build: ## Install Cypress, build containers
	${ACCEPTANCE} --profile dev build --no-cache

.PHONY: acceptance-start
acceptance-start: ## Start acceptance server-containers
	${ACCEPTANCE} --profile dev up -d --force-recreate

# .PHONY: test-acceptance
# test-acceptance: ## Start Cypress
# 	(cd acceptance && ./node_modules/.bin/cypress open --config-file cypress.monolingual.config.js)

# .PHONY: test-acceptance-headless
# # test-acceptance-headless: install-acceptance ## Run cypress tests in CI
# test-acceptance-headless: ## Run cypress tests in CI
# 	(cd acceptance && ./node_modules/.bin/cypress run --config-file cypress.monolingual.config.js)

# DEBUG CYPRESS
.PHONY: acceptance-test-test
acceptance-test-test: ## Start Cypress in interactive mode
	pnpm --filter @plone/volto exec cypress open --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/example.*.{js,jsx,ts,tsx}'

.PHONY: acceptance-test
acceptance-test: ## Start Cypress in interactive mode
	pnpm --filter @plone/volto exec cypress open --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/monolingual.*.{js,jsx,ts,tsx}'

.PHONY: ci-acceptance-test
ci-acceptance-test: ## Run cypress tests in headless mode for CI
	pnpm --filter @plone/volto exec cypress run --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/monolingual.*.{js,jsx,ts,tsx}'

.PHONY: stop-test-acceptance-server
stop-test-acceptance-server: ## Stop acceptance server
	${ACCEPTANCE} down

.PHONY: status-test-acceptance-server
status-test-acceptance-server: ## Status of Acceptance Server
	${ACCEPTANCE} ps


# Acceptance multilingual
.PHONY: acceptance-frontend-dev-start-multilingual
acceptance-frontend-dev-start-multilingual: ## Start acceptance frontend in development mode
	SEARCHKITBLOCK_TESTING_LANGUAGESETTINGS=multilingual RAZZLE_API_PATH=http://localhost:55001/plone pnpm start

.PHONY: acceptance-frontend-prod-start-multilingual
acceptance-frontend-prod-start-multilingual: ## Start acceptance frontend in production mode
	SEARCHKITBLOCK_TESTING_LANGUAGESETTINGS=multilingual RAZZLE_API_PATH=http://localhost:55001/plone pnpm build && pnpm start:prod

.PHONY: acceptance-build-multilingual
acceptance-build-multilingual: ## multilingual – Install Cypress, build containers for multilingual site
	@echo ${PLONE_VERSION}
	@echo ${ACCEPTANCE_MULTILINGUAL}
	${ACCEPTANCE_MULTILINGUAL} --profile multilingual build --no-cache

.PHONY: acceptance-start-containers-multilingual
acceptance-start-multilingual: ## multilingual – Start acceptance server-containers for multilingual site
	${ACCEPTANCE_MULTILINGUAL} --profile multilingual up -d --force-recreate

# .PHONY: test-acceptance-multilingual
# test-acceptance-multilingual: ## Start Cypress
# 	(cd acceptance && ./node_modules/.bin/cypress open --config-file cypress.multilingual.config.js)

# .PHONY: test-acceptance-headless-multilingual
# # test-acceptance-headless: install-acceptance ## Run cypress tests in CI
# test-acceptance-headless-multilingual: ## Run cypress tests in CI
# 	(cd acceptance && ./node_modules/.bin/cypress run --config-file cypress.multilingual.config.js)

.PHONY: acceptance-test
acceptance-test-multilingual: ## Start Cypress in interactive mode
	pnpm --filter @plone/volto exec cypress open --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/multilingual.*.{js,jsx,ts,tsx}'

.PHONY: ci-acceptance-test
ci-acceptance-test-multilingual: ## Run cypress tests in headless mode for CI
	pnpm --filter @plone/volto exec cypress run --config-file $(CURRENT_DIR)/cypress.config.js --config specPattern=$(CURRENT_DIR)'/cypress/tests/**/multilingual.*.{js,jsx,ts,tsx}'

