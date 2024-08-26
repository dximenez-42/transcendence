DOCKER = docker compose

all: up

up:
	$(DOCKER) up --detach --build

start: 
	$(DOCKER) start

down: 
	$(DOCKER) down

stop:
	$(DOCKER) stop

clean:
	$(DOCKER) down --volumes

fclean:
	docker stop $$(docker ps -qa)
	docker rm $$(docker ps -qa)
	docker rmi -f $$(docker images -qa)
	docker volume rm $$(docker volume ls -q)
	docker network rm $$(docker network ls -q) 2>/dev/null


auth:
	$(DOCKER) up auth-backend --detach --build

games:
	$(DOCKER) up games-backend --detach --build