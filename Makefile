# Makefile volto-searchkit-block

SHELL:=bash
.ONESHELL:
# .SHELLFLAGS:=-xeu -o pipefail -O inherit_errexit -c
.SILENT:
.DELETE_ON_ERROR:
MAKEFLAGS+=--warn-undefined-variables
MAKEFLAGS+=--no-builtin-rules

include variables.mk

CURRENT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

# We like colors
# From: https://coderwall.com/p/izxssa/colored-makefile-for-golang-projects
RED=`tput setaf 1`
GREEN=`tput setaf 2`
RESET=`tput sgr0`
YELLOW=`tput setaf 3`

BACKEND_ADDONS='collective.elastic.plone ${KGS} $(TESTING_ADDONS)'
DEV_COMPOSE=dockerfiles/docker-compose.yml
ACCEPTANCE_COMPOSE=acceptance/docker-compose.yml
CMD_ENVS=CURRENT_DIR=${CURRENT_DIR} ADDON_NAME=${ADDON_NAME} ADDON_PATH=${ADDON_PATH} VOLTO_VERSION=${VOLTO_VERSION} PLONE_VERSION=${PLONE_VERSION} BACKEND_ADDONS=${BACKEND_ADDONS}
CMD=${CMD_ENVS} docker compose
DOCKER_COMPOSE=${CMD} -p ${ADDON_PATH} -f ${DEV_COMPOSE}
ACCEPTANCE=${CMD} -p ${ADDON_PATH}-acceptance -f ${ACCEPTANCE_COMPOSE}
ACCEPTANCE_MULTILINGUAL=${CMD} -p ${ADDON_PATH}-acceptance-multilingual -f ${ACCEPTANCE_COMPOSE}

.PHONY: all
all: help

.PHONY: help
help:		## Show this help.
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

# TODO Add backend-addons
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


# Dev Helpers
.PHONY: i18n
i18n: ## Sync i18n
	${DOCKER_COMPOSE} run addon-dev i18n

.PHONY: format
format: ## Format codebase
	${DOCKER_COMPOSE} run addon-dev lint:fix
	${DOCKER_COMPOSE} run addon-dev prettier:fix
	${DOCKER_COMPOSE} run addon-dev stylelint:fix

.PHONY: lint
lint: ## Lint Codebase
	${DOCKER_COMPOSE} run addon-dev lint
	${DOCKER_COMPOSE} run addon-dev prettier
	${DOCKER_COMPOSE} run addon-dev stylelint

.PHONY: test
test: ## Run unit tests
	${DOCKER_COMPOSE} run addon-dev test --watchAll

.PHONY: test-ci
test-ci: ## Run unit tests in CI
	${DOCKER_COMPOSE} run -e CI=1 addon-dev test


# Acceptance
.PHONY: build-acceptance
build-acceptance: ## Install Cypress, build containers
	(cd acceptance && yarn)
	${ACCEPTANCE} --profile dev build --no-cache

.PHONY: start-acceptance-containers
start-acceptance: ## Start acceptance server-containers
	${ACCEPTANCE} --profile dev up -d --force-recreate

.PHONY: test-acceptance
test-acceptance: ## Start Cypress
	(cd acceptance && ./node_modules/.bin/cypress open)

.PHONY: test-acceptance-headless
# test-acceptance-headless: install-acceptance ## Run cypress tests in CI
test-acceptance-headless: ## Run cypress tests in CI
	(cd acceptance && ./node_modules/.bin/cypress run)

.PHONY: stop-test-acceptance-server
stop-test-acceptance-server: ## Stop acceptance server
	${ACCEPTANCE} down

.PHONY: status-test-acceptance-server
status-test-acceptance-server: ## Status of Acceptance Server
	${ACCEPTANCE} ps


# Acceptance multilingual
.PHONY: build-acceptance-multilingual
build-acceptance-multilingual: ## multilingual – Install Cypress, build containers for multilingual site
	(cd acceptance && yarn)
	@echo ${PLONE_VERSION}
	@echo ${ACCEPTANCE_MULTILINGUAL}
	${ACCEPTANCE_MULTILINGUAL} --profile multilingual build --no-cache

.PHONY: start-acceptance-containers-multilingual
start-acceptance-multilingual: ## multilingual – Start acceptance server-containers for multilingual siet
	${ACCEPTANCE_MULTILINGUAL} --profile multilingual up -d --force-recreate

.PHONY: test-acceptance
test-acceptance-multilingual: ## Start Cypress
	(cd acceptance && ./node_modules/.bin/cypress open --config-file cypress.multilingual.config.js)

.PHONY: test-acceptance-headless
# test-acceptance-headless: install-acceptance ## Run cypress tests in CI
test-acceptance-headless-multilingual: ## Run cypress tests in CI
	(cd acceptance && ./node_modules/.bin/cypress run --config-file cypress.multilingual.config.js)
