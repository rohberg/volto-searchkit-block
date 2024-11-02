### Defensive settings for make:
#     https://tech.davis-hansson.com/p/make/
SHELL:=bash
.ONESHELL:
.SHELLFLAGS:=-xeu -o pipefail -O inherit_errexit -c
.SILENT:
.DELETE_ON_ERROR:
MAKEFLAGS+=--warn-undefined-variables
MAKEFLAGS+=--no-builtin-rules

# We like colors
# From: https://coderwall.com/p/izxssa/colored-makefile-for-golang-projects
RED=`tput setaf 1`
GREEN=`tput setaf 2`
RESET=`tput sgr0`
YELLOW=`tput setaf 3`

IMAGE_NAME_PREFIX=ghcr.io/rohberg/volto-searchkit-block-testing-profiles
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
PLONE_VERSION=$(shell cat $(BACKEND_FOLDER)/version.txt)
EXAMPLE_CONTENT_FOLDER=${BACKEND_FOLDER}/src/project/title/setuphandlers/examplecontent

GIT_FOLDER=$(BACKEND_FOLDER)/.git
VENV_FOLDER=$(BACKEND_FOLDER)/.venv
BIN_FOLDER=$(VENV_FOLDER)/bin


all: build

# Add the following 'help' target to your Makefile
# And add help text after each target name starting with '\#\#'
.PHONY: help
help: ## This help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

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
	PYTHONWARNINGS=ignore $(BIN_FOLDER)/runwsgi instance/etc/zope.ini

.PHONY: console
console: instance/etc/zope.ini ## Start a console into a Plone instance
	PYTHONWARNINGS=ignore $(BIN_FOLDER)/zconsole debug instance/etc/zope.conf
