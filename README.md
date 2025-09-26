# Kafka Playground

Spin up Kafka locally with Docker Compose as you build out producers and consumers.

## Start Kafka

```shell
docker compose up -f infra/docker-compose.yml --detach
```

```shell
docker exec -it --workdir /opt/kafka/bin/ kafka sh
```
