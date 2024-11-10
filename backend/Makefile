### Defensive settings for make:
#     https://tech.davis-hansson.com/p/make/
SHELL:=bash
.ONESHELL:
.SHELLFLAGS:=-xeu -o pipefail -O inherit_errexit -c
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

IMAGE_NAME_PREFIX=ghcr.io/rohberg/searchkit-block
IMAGE_TAG=latest

# Python checks
PYTHON?=python3

# installed?
ifeq (, $(shell which $(PYTHON) ))
  $(error "PYTHON=$(PYTHON) not found in $(PATH)")
endif

# version ok?
PYTHON_VERSION_MIN=3.8
PYTHON_VERSION_OK=$(shell $(PYTHON) -c "import sys; print((int(sys.version_info[0]), int(sys.version_info[1])) >= tuple(map(int, '$(PYTHON_VERSION_MIN)'.split('.'))))")
ifeq ($(PYTHON_VERSION_OK),0)
  $(error "Need python $(PYTHON_VERSION) >= $(PYTHON_VERSION_MIN)")
endif

PLONE_SITE_ID=Plone
BACKEND_FOLDER=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
EXAMPLE_CONTENT_FOLDER=${BACKEND_FOLDER}/src/searchkit/block/setuphandlers/examplecontent

GIT_FOLDER=$(BACKEND_FOLDER)/.git
VENV_FOLDER=$(BACKEND_FOLDER)/.venv
BIN_FOLDER=$(VENV_FOLDER)/bin


ACCEPTANCE_BACKEND_ADDONS='collective.elastic.plone ${KGS} $(TESTING_ADDONS)'
ACCEPTANCE_COMPOSE_FILE=docker-compose-acceptance.yml
CMD_ENVS=CURRENT_DIR=${CURRENT_DIR} PLONE_VERSION=${PLONE_VERSION}
ACCEPTANCE_CMD=${CMD_ENVS} BACKEND_ADDONS=${ACCEPTANCE_BACKEND_ADDONS} docker compose
ACCEPTANCE_COMPOSE_MONOLINGUAL=${ACCEPTANCE_CMD} -p ${PROJECT_NAME}-acceptance-monolingual -f ${ACCEPTANCE_COMPOSE_FILE}
ACCEPTANCE_COMPOSE_MULTILINGUAL=${ACCEPTANCE_CMD} -p ${PROJECT_NAME}-acceptance-multilingual -f ${ACCEPTANCE_COMPOSE_FILE}

DEV_BACKEND_ADDONS='collective.elastic.plone ${KGS}'
DEV_COMPOSE_FILE=docker-compose-dev.yml
DEV_CMD=${CMD_ENVS} BACKEND_ADDONS=${DEV_BACKEND_ADDONS} docker compose
DEV_COMPOSE_MONOLINGUAL=${DEV_CMD} -p ${PROJECT_NAME}-dev-monolingual -f ${DEV_COMPOSE_FILE}
DEV_COMPOSE_MULTILINGUAL=${DEV_CMD} -p ${PROJECT_NAME}-dev-multilingual -f ${DEV_COMPOSE_FILE}


# Add the following 'help' target to your Makefile
# And add help text after each target name starting with '\#\#'
.PHONY: help
help: ## This help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


# ########################################################################
# development
# ########################################################################

$(BIN_FOLDER)/pip $(BIN_FOLDER)/tox $(BIN_FOLDER)/pipx $(BIN_FOLDER)/uv $(BIN_FOLDER)/mxdev:
	@echo "$(GREEN)==> Setup Virtual Env$(RESET)"
	$(PYTHON) -m venv $(VENV_FOLDER)
	$(BIN_FOLDER)/pip install -U "pip" "uv" "wheel" "pipx" "mxdev" "tox" "pre-commit"
	if [ -d $(GIT_FOLDER) ]; then $(BIN_FOLDER)/pre-commit install; else echo "$(RED) Not installing pre-commit$(RESET)";fi

instance/etc/zope.ini: $(BIN_FOLDER)/pip  ## Create instance configuration
	@echo "$(GREEN)==> Create instance configuration$(RESET)"
	$(BIN_FOLDER)/pipx run cookiecutter -f --no-input --config-file instance.yaml gh:plone/cookiecutter-zope-instance

.PHONY: config
config: instance/etc/zope.ini

.PHONY: build-dev
build-dev: config ## Install Plone packages
	@echo "$(GREEN)==> Setup Build$(RESET)"
	$(BIN_FOLDER)/mxdev -c mx.ini
	$(BIN_FOLDER)/uv pip install -r requirements-mxdev.txt

.PHONY: install
install: build-dev ## Install Plone

.PHONY: build
build: build-dev ## Install Plone

.PHONY: clean
clean: ## Clean environment
	@echo "$(RED)==> Cleaning environment and build$(RESET)"
	rm -rf $(VENV_FOLDER) pyvenv.cfg .installed.cfg instance .tox .venv .pytest_cache

.PHONY: start
start: ## Start a Plone instance on localhost:8080
	source .dev-env
	PYTHONWARNINGS=ignore $(BIN_FOLDER)/runwsgi instance/etc/zope.ini

.PHONY: console
console: instance/etc/zope.ini ## Start a console into a Plone instance
	source .dev-env
	PYTHONWARNINGS=ignore $(BIN_FOLDER)/zconsole debug instance/etc/zope.conf

.PHONY: create-site-monolingual
create-site-monolingual: instance/etc/zope.ini ## Create a new site from scratch
	source .dev-env
	DELETE_EXISTING=true PYTHONWARNINGS=ignore $(BIN_FOLDER)/zconsole run instance/etc/zope.conf ./scripts/create_site.py

.PHONY: create-site-multilingual
create-site-multilingual: instance/etc/zope.ini ## Create a new site from scratch
	source .dev-env
	DELETE_EXISTING=true ISMULTILINGUAL=true PYTHONWARNINGS=ignore $(BIN_FOLDER)/zconsole run instance/etc/zope.conf ./scripts/create_site.py

.PHONY: dev-index-start-monolingual
dev-index-start-monolingual: ## Start dev containers (OpenSearch, ingest, etc.)
	${DEV_COMPOSE_MONOLINGUAL} --profile monolingual up -d --force-recreate

.PHONY: dev-index-start-multilingual
dev-index-start-multilingual: ## Start dev containers (OpenSearch, ingest, etc.)
	${DEV_COMPOSE_MULTILINGUAL} --profile multilingual up -d --force-recreate

# ########################################################################
# Acceptance monolingual
# ########################################################################

.PHONY: acceptance-backend-start-monolingual
acceptance-backend-start-monolingual: ## Start acceptance containers (backend and OpenSearch)
	${ACCEPTANCE_COMPOSE_MONOLINGUAL} --profile monolingual up -d --force-recreate

.PHONY: acceptance-backend-image-build-monolingual
acceptance-backend-image-build-monolingual: ## Build acceptance containers (backend and OpenSearch)
	${ACCEPTANCE_COMPOSE_MONOLINGUAL} --profile monolingual build --no-cache


# ########################################################################
# Acceptance multilingual
# ########################################################################

.PHONY: acceptance-backend-start-multilingual
acceptance-backend-start-multilingual: ## Start acceptance containers (backend and OpenSearch)
	${ACCEPTANCE_COMPOSE_MULTILINGUAL} --profile multilingual up -d --force-recreate
