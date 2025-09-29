# Kafka Playground

Spin up Kafka locally with Docker Compose as you build out producers and consumers.

## Kafka & Redis

```shell
docker compose up -f infra/docker-compose.yml -d
```

### Kafka
```shell
docker exec -it -w /opt/kafka/bin/ kafka sh
```

Inside the Kafka container, run commands like:
```shell
./kafka-topics.sh --bootstrap-server localhost:9092 --create --topic orders
# create a new topic

./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic orders
# consume topic
```

### Redis
```shell
docker exec -it redis redis-cli
```