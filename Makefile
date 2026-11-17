.PHONY: dev verify build up down

dev:
	npm run dev

verify:
	npm run verify

# Production image (nginx) on http://localhost:8081
build:
	docker build --target production -t kitchenxhire-dashboard .

up: build
	docker run --rm -d -p 8081:80 --name kitchenxhire-dashboard kitchenxhire-dashboard

down:
	docker stop kitchenxhire-dashboard
