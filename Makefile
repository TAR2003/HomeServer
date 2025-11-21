# Home Media Server - Makefile
# Makes common tasks easier with simple commands

.PHONY: help init start stop restart logs build clean backup status

help: ## Show this help message
	@echo "Home Media Server - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

init: ## Initialize the project (create directories and .env)
	@echo "Initializing Home Media Server..."
	@mkdir -p media/images-videos media/movies media/series media/thumbnails
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env file - please update it!"; fi
	@echo "Initialization complete!"

start: ## Start all services
	@echo "Starting Home Media Server..."
	@docker-compose up -d
	@echo "Server started! Access at http://localhost"

stop: ## Stop all services
	@echo "Stopping Home Media Server..."
	@docker-compose down
	@echo "Server stopped!"

restart: ## Restart all services
	@echo "Restarting Home Media Server..."
	@docker-compose restart
	@echo "Server restarted!"

logs: ## Show logs (press Ctrl+C to exit)
	@docker-compose logs -f

logs-backend: ## Show backend logs only
	@docker-compose logs -f backend

logs-frontend: ## Show frontend logs only
	@docker-compose logs -f frontend

logs-nginx: ## Show nginx logs only
	@docker-compose logs -f nginx

logs-db: ## Show database logs only
	@docker-compose logs -f postgres

build: ## Build all containers
	@echo "Building containers..."
	@docker-compose build
	@echo "Build complete!"

rebuild: ## Rebuild and restart all services
	@echo "Rebuilding and restarting..."
	@docker-compose up -d --build
	@echo "Rebuild complete!"

clean: ## Remove containers and images (keeps volumes)
	@echo "Cleaning up containers and images..."
	@docker-compose down --rmi all
	@echo "Cleanup complete!"

clean-all: ## Remove everything including volumes (DESTRUCTIVE!)
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): " confirm && [ $$confirm = "yes" ] || exit 1
	@docker-compose down -v --rmi all
	@echo "Everything removed!"

backup: ## Backup database and media
	@echo "Creating backup..."
	@mkdir -p backups
	@docker exec media-server-db pg_dump -U postgres mediaserver > backups/db-$$(date +%Y%m%d-%H%M%S).sql
	@docker run --rm -v media_storage:/data -v $$(pwd)/backups:/backup alpine tar czf /backup/media-$$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@echo "Backup complete! Check the backups/ directory"

restore-db: ## Restore database from latest backup
	@echo "Restoring database from latest backup..."
	@latest=$$(ls -t backups/db-*.sql 2>/dev/null | head -1); \
	if [ -z "$$latest" ]; then echo "No backup found!"; exit 1; fi; \
	docker exec -i media-server-db psql -U postgres mediaserver < $$latest
	@echo "Database restored!"

status: ## Show status of all services
	@docker-compose ps

stats: ## Show resource usage
	@docker stats --no-stream

shell-backend: ## Open shell in backend container
	@docker exec -it media-server-backend sh

shell-db: ## Open PostgreSQL shell
	@docker exec -it media-server-db psql -U postgres mediaserver

update: ## Pull latest code and rebuild
	@echo "Updating Home Media Server..."
	@git pull origin main
	@docker-compose up -d --build
	@echo "Update complete!"

dev: ## Start in development mode
	@echo "Starting in development mode..."
	@npm install
	@npm run dev

install: ## Install dependencies
	@npm install

test: ## Run tests
	@npm test

lint: ## Run linter
	@npm run lint

prune: ## Clean up unused Docker resources
	@echo "Cleaning up Docker resources..."
	@docker system prune -af
	@echo "Docker cleanup complete!"
