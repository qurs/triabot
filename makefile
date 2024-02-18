start:
	@npm install
	@docker compose up -d
	@make attach

start_detach:
	@docker compose up -d

attach:
	@docker logs -n 100 discordbot
	@docker attach discordbot

stop:
	@docker compose down