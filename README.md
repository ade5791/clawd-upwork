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
- Job search integrations (Upwork scraper)
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

## Scrape + ingest (manual run)
```bash
# Requires a logged-in Upwork browser session
set JWT=YOUR_JWT_TOKEN
set SEARCH=automation data extraction web scraping
npx tsx src/scripts/scrape_and_ingest.ts
```
