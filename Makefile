COMPOSE ?= docker compose

.PHONY: run
run:
	npm run build --force && npm run start

.PHONY: local-infra-up
local-infra-up:
	$(COMPOSE) up -d --build frontend

.PHONY: local-infra-down
local-infra-down:
	$(COMPOSE) down
