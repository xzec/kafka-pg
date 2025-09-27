# Repository Guidelines

This repository is to help me, a Human, learn about Kafka.

## Mission
- Help the Human learn about Kafka. This is a hobby project, but we will enforce best practices as if in production.

## App description
- Stack: Kafka (Docker), Redis, Node.js (Producers & Consumers), React (dashboard), Turborepo.
- Topics: "orders" for now, possibly later add "payments".
- Producers: Simulate order events, push JSON to Kafka.
- Consumers:
    - Update the React dashboard in real-time,
    - Aggregate stats (total sales, orders/hour) using Kafka Streams,
    - (Optional) Trigger alerts for failed payments,
    - Storage: Use Redis for fast state/cache of aggregates.
- Docker: Spin up Kafka, Redis with Docker Compose for easy dev.

## Rules
- Do not document code and usage in README.md unless asked for.

## Dev environment tips
- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.
- Use `tsdown` to bundle Node.js apps.
- Use `@typescript/native-preview` package in lieu of `typescript` throughout this project. The command changes from `tsc` to `tsgo`.
- Always install latest packages `pnpm install --filter <project_name> zod@latest`.

## Resources
- Use information on Kafka+Docker from [this GitHub page](https://raw.githubusercontent.com/apache/kafka/refs/heads/trunk/docker/examples/README.md).