# Upwork Tools Backend

Backend scaffold for Upwork-like tool suite.

## Stack
- Node.js + TypeScript + Fastify
- Postgres + Redis (docker-compose)
- Swagger docs at `/docs`

## Getting started
```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:migrate
npm run prisma:generate
npm run dev
```

## Next steps
- Job search integrations
- Proposal generator

## Worker
Run a worker process:
```bash
node dist/worker.js
# or during dev
tsx src/worker.ts
```

## Scheduler
Run the automation scheduler:
```bash
tsx src/scheduler.ts
```
