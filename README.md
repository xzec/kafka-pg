# Kafka Playground

Spin up Kafka locally with Docker Compose as you build out producers and consumers.

## Start Kafka

```shell
docker compose up -f infra/docker-compose.yml --detach
```

```shell
docker exec -it --workdir /opt/kafka/bin/ kafka sh
```

Once inside the container, run commands like:
```shell
./kafka-topics.sh --bootstrap-server localhost:9092 --create --topic orders
# create a new topic

./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic orders
# consume topic
```
