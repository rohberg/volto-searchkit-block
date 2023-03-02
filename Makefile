# Yeoman Volto App development
# TODO testing searchkitblock: docker containers with backend, elasticsearch, redis, celery

### Defensive settings for make:
#     https://tech.davis-hansson.com/p/make/
SHELL:=bash
.ONESHELL:
.SHELLFLAGS:=-xeu -o pipefail -O inherit_errexit -c
.SILENT:
.DELETE_ON_ERROR:
MAKEFLAGS+=--warn-undefined-variables
MAKEFLAGS+=--no-builtin-rules

# Project settings

DIR=$(shell basename $$(pwd))
ADDON ?= "volto-searchkit-block"


# Recipe snippets for reuse

# We like colors
# From: https://coderwall.com/p/izxssa/colored-makefile-for-golang-projects
RED=`tput setaf 1`
GREEN=`tput setaf 2`
RESET=`tput sgr0`
YELLOW=`tput setaf 3`


# Top-level targets
########################

addon-testing-project:  ## Create Volto project with this add-on
	# npm install -g yo
	# npm install -g @plone/generator-volto
	# npm install -g mrs-developer
	npx -p @plone/scripts addon clone --canary .
	cp -r webpack.config.js addon-testing-project/src/addons/volto-searchkit-block/webpack.config.js
	cp -r cypress.config.js addon-testing-project/src/addons/volto-searchkit-block/cypress.config.js
	cp -r cypress addon-testing-project/src/addons/volto-searchkit-block/cypress
	cd addon-testing-project && yarn
	@echo "-------------------"
	@echo "$(GREEN)Volto project is ready!$(RESET)"
	@echo "$(RED)Now run: yarn start$(RESET)"

.PHONY: all
all: addon-testing-project

.PHONY: start-addon-testing-project
start-addon-testing-project: addon-testing-project  ## Start Volto project
	(cd addon-testing-project &&	yarn start)

.PHONY: consolidate-addon-testing-project
consolidate-addon-testing-project: addon-testing-project  ## Consolidate add-on changes
	npx -p @plone/scripts addon consolidate


# Testing
########################

.PHONY: test-start-backend-plone6-mac
test-start-backend-plone6-mac:  ## Start Test Plone Backend, elk, redis, TODO celery
	@echo "$(GREEN)==> Start Test Plone Backend$(RESET)"
	cd testing/mac/Plone6/
	docker compose up

### Acceptance tests (Cypress)

.PHONY: start-cypress-frontend
start-cypress-frontend: addon-testing-project ## Start Test
	@echo "$(GREEN)==> Start Test$(RESET)"
	(cd addon-testing-project &&	yarn cypress:open)


# TODO make run-acceptence-tests-headless
# TODO make run-acceptence-tests-visible


# Development
##########################

.PHONY: dev-start-backend
dev-start-backend:		## Start a local dev backend
	@echo "$(GREEN)==> Start local Plone Backend$(RESET)"
	$(MAKE) -C "./api/" start


.PHONY: help
help:		## Show this help.
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"
