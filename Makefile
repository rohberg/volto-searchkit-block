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
# OPENSEARCH_COMPOSE=docker-opensearch/docker-compose.yml
CMD=CURRENT_DIR=${CURRENT_DIR} ADDON_NAME=${ADDON_NAME} ADDON_PATH=${ADDON_PATH} VOLTO_VERSION=${VOLTO_VERSION} PLONE_VERSION=${PLONE_VERSION} BACKEND_ADDONS=${BACKEND_ADDONS} docker compose
DOCKER_COMPOSE=${CMD} -p ${ADDON_PATH} -f ${DEV_COMPOSE}
ACCEPTANCE=${CMD} -p ${ADDON_PATH}-acceptance -f ${ACCEPTANCE_COMPOSE}
# OPENSEARCH=CURRENT_DIR=${CURRENT_DIR} docker compose -p ${ADDON_PATH}-opensearch -f ${OPENSEARCH_COMPOSE}


.PHONY: all
all: help

.PHONY: help
help:		## Show this help.
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

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

.PHONY: start-dev
start-dev: ## Starts Dev container
	@echo "$(GREEN)==> Start Addon Development container $(RESET)"
	${DOCKER_COMPOSE} up addon-dev

.PHONY: dev
dev: ## Develop the addon
	@echo "$(GREEN)==> Start Development Environment $(RESET)"
	make build-backend
	make start-backend
	make build-addon
	make start-dev

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

# Acceptance opensearch
# # TODO marry OPENSEARCH with backend acceptance
# .PHONY: build-acceptance-opensearch
# build-acceptance-opensearch: ## build opensearch containers
# 	(cd docker-opensearch)
# 	${OPENSEARCH} --profile dev build

# .PHONY: start-test-acceptance-server
# start-test-acceptance-server-opensearch: ## Start acceptance opensearch containers
# 	${OPENSEARCH} --profile dev up -d

# Acceptance backend and frontend
.PHONY: build-acceptance
build-acceptance: ## Install Cypress, build containers
	(cd acceptance && yarn)
	${ACCEPTANCE} --profile dev build

.PHONY: start-acceptance-containers
start-acceptance: ## Start acceptance server-containers
	${ACCEPTANCE} --profile dev up -d --force-recreate

# TODO Maybe depend on build and start?
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
	${OPENSEARCH} down

.PHONY: status-test-acceptance-server
status-test-acceptance-server: ## Status of Acceptance Server
	${ACCEPTANCE} ps
