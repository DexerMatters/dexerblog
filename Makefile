# DexerBlog Development Makefile

.PHONY: help dev dev-build prod prod-build clean logs stop restart

# Default target
help:
	@echo "DexerBlog Development Commands"
	@echo "=============================="
	@echo "Development:"
	@echo "  make dev          - Start development environment with hot reloading"
	@echo "  make dev-build    - Build and start development environment"
	@echo "  make logs         - Show development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build and start production environment"
	@echo ""
	@echo "Management:"
	@echo "  make stop         - Stop all containers"
	@echo "  make clean        - Stop and remove all containers, networks, and volumes"
	@echo "  make restart      - Restart development environment"
	@echo ""

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml up --build

# Production commands  
prod:
	docker-compose up

prod-build:
	docker-compose up --build

# Management commands
logs:
	docker-compose -f docker-compose.dev.yml logs -f

stop:
	docker-compose -f docker-compose.dev.yml down
	docker-compose down

clean:
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker-compose down -v --remove-orphans
	docker system prune -f

restart:
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.dev.yml up --build

# Individual service commands
frontend-dev:
	docker-compose -f docker-compose.dev.yml up frontend-dev db

backend-dev:
	docker-compose -f docker-compose.dev.yml up backend-dev db

# Database commands
db-only:
	docker-compose -f docker-compose.dev.yml up db
