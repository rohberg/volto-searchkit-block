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

.PHONY: all
all: build

# Add the following 'help' target to your Makefile
# And add help text after each target name starting with '\#\#'
.PHONY: help
help: .SHELLFLAGS:=-eu -o pipefail -O inherit_errexit -c
help: ## This help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


bin/pip:
	@echo "$(GREEN)==> Setup Virtual Env$(RESET)"
	python -m venv venv
	venv/bin/pip install -U "pip" "wheel" "cookiecutter" "mxdev"

instance/etc/zope.ini:	bin/pip
	@echo "$(GREEN)==> Install Plone and create instance$(RESET)"
	venv/bin/cookiecutter -f --no-input --config-file instance.yaml https://github.com/plone/cookiecutter-zope-instance

.PHONY: build
build: instance/etc/zope.ini ## pip install Plone packages
	@echo "$(GREEN)==> Setup Build$(RESET)"
	venv/bin/mxdev -c mx.ini
	venv/bin/pip install -r requirements-mxdev.txt

.PHONY: start
start: build ## Start a Plone instance on localhost:8080
	PYTHONWARNINGS=ignore venv/bin/runwsgi -d instance/etc/zope.ini
