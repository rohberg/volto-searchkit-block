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
ACCEPTANCE_COMPOSE_FILE=dockerfiles/docker-compose-acceptance.yml
CMD_ENVS=CURRENT_DIR=${CURRENT_DIR} PLONE_VERSION=${PLONE_VERSION}
ACCEPTANCE_CMD=${CMD_ENVS} BACKEND_ADDONS=${ACCEPTANCE_BACKEND_ADDONS} docker compose
ACCEPTANCE_COMPOSE_MONOLINGUAL=${ACCEPTANCE_CMD} -p ${PROJECT_NAME}-acceptance-monolingual -f ${ACCEPTANCE_COMPOSE_FILE}
ACCEPTANCE_COMPOSE_MULTILINGUAL=${ACCEPTANCE_CMD} -p ${PROJECT_NAME}-acceptance-multilingual -f ${ACCEPTANCE_COMPOSE_FILE}

DEV_BACKEND_ADDONS='collective.elastic.plone ${KGS}'
DEV_COMPOSE_FILE=dockerfiles/docker-compose-dev.yml
DEV_CMD=${CMD_ENVS} BACKEND_ADDONS=${DEV_BACKEND_ADDONS} docker compose
DEV_COMPOSE_MONOLINGUAL=${DEV_CMD} -p ${PROJECT_NAME}-dev-monolingual -f ${DEV_COMPOSE_FILE}
DEV_COMPOSE_MULTILINGUAL=${DEV_CMD} -p ${PROJECT_NAME}-dev-multilingual -f ${DEV_COMPOSE_FILE}


# Add the following 'help' target to your Makefile
# And add help text after each target name starting with '\#\#'
.PHONY: help
help: ## This help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: dev-backend-start-monolingual
dev-backend-start-monolingual: ## Start dev containers (backend and OpenSearch)
	${DEV_COMPOSE_MONOLINGUAL} --profile monolingual up -d --force-recreate

.PHONY: dev-backend-start-multilingual
dev-backend-start-multilingual: ## Start dev containers (backend and OpenSearch)
	${DEV_COMPOSE_MULTILINGUAL} --profile multilingual up -d --force-recreate

# ########################################################################
# Acceptance monolingual
# ########################################################################

.PHONY: acceptance-backend-start-monolingual
acceptance-backend-start-monolingual: ## Start acceptance containers (backend and OpenSearch)
	${ACCEPTANCE_MONOLINGUAL} --profile monolingual up -d --force-recreate

.PHONY: acceptance-backend-image-build-monolingual
acceptance-backend-image-build-monolingual: ## Build acceptance containers (backend and OpenSearch)
	${ACCEPTANCE_MONOLINGUAL} --profile monolingual build --no-cache


# ########################################################################
# Acceptance multilingual
# ########################################################################

.PHONY: acceptance-backend-start-multilingual
acceptance-backend-start-multilingual: ## Start acceptance containers (backend and OpenSearch)
	${ACCEPTANCE_MULTILINGUAL} --profile multilingual up -d --force-recreate
