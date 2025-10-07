.PHONY: help up down restart logs shell test test-watch db-migrate db-push db-generate db-studio db-seed clean rebuild fix-permissions

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all services in detached mode
	docker compose up -d

up-attach: ## Start all services in attached mode
	docker compose up

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## Show logs from all services
	docker compose logs -f

shell: ## Open shell in app container
	docker compose exec app sh

test: ## Run tests
	docker compose exec app pnpm test $(ARGS)

test-watch: ## Run tests in watch mode
	docker compose exec app pnpm test:watch $(ARGS)

db-migrate: ## Run database migrations
	docker compose exec app pnpm db:migrate

db-push: ## Push schema changes to database
	docker compose exec app pnpm db:push

db-generate: ## Generate database migrations
	docker compose exec app pnpm db:generate

db-studio: ## Open Drizzle Studio
	docker compose exec app pnpm db:studio

db-seed: ## Seed database with test data
	docker compose exec app pnpm db:seed

clean: ## Remove all containers, volumes, and images
	docker compose down -v --remove-orphans
	docker compose rm -f

rebuild: ## Rebuild and restart all services
	docker compose up -d --build

fix-permissions: ## Fix file permissions (run if you get EACCES errors)
	sudo chown -R $(shell id -u):$(shell id -g) .
