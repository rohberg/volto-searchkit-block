# Yeoman Volto App development

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

addon-testing-project: ## Create Volto project
	npm install -g yo
	npm install -g @plone/generator-volto
	npm install -g mrs-developer
	npx -p @plone/scripts addon clone .
	cd addon-testing-project && yarn
	@echo "-------------------"
	@echo "$(GREEN)Volto project is ready!$(RESET)"
	@echo "$(RED)Now run: yarn start$(RESET)"

.PHONY: all
all: addon-testing-project

start-addon-testing-project: addon-testing-project ## Start Volto project
	(cd addon-testing-project &&	yarn start)

consolidate-addon-testing-project:
	npx -p @plone/scripts addon consolidate


# Testing
########################

.PHONY: test-start-backend-plone6-mac
test-start-backend-plone6-mac: ## Start Test Plone Backend
	@echo "$(GREEN)==> Start Test Plone Backend$(RESET)"
	cd docker/mac/Plone6/
	docker compose up
	docker compose exec backend bin/robot-server plone.app.robotframework.testing.VOLTO_ROBOT_TESTING
	docker compose exec backend bin/celery -A collective.elastic.ingest.celery.app multi restart workersearchkitblock --logfile="/app/celery/celery%n%I.log" --pidfile="/app/celery/celery%n.pid"

##########################

.PHONY: start-backend-docker
start-backend-docker:		## Starts a Docker-based backend
	@echo "$(GREEN)==> Start Docker-based Plone Backend$(RESET)"
	docker run -it --rm --name=plone -p 8080:8080 -e SITE=Plone -e ADDONS="plone.volto" -e ZCML="plone.volto.cors" plone

.PHONY: help
help:		## Show this help.
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"
